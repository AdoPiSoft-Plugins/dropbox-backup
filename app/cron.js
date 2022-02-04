"use strict";
const {machine} = require('@adopisoft/exports')
const backup = require('@adopisoft/core/backup/index.js')
const system_logs = require('@adopisoft/core/system-logs')
const path = require("path");
const cfg_file = process.env.NODE_ENV == "development" ? path.join(__dirname, '/../', "tmp", "dropbox-backup-creds.json") : path.join("/etc", "dropbox-backup-creds.json");
const {
  promisify
} = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);

const script = path.join(__dirname, "/../" + "backup.sh");
const {
  spawn
} = require("child_process");
var schedule = require("node-schedule");

var job;
exports.init = async() => {
  await exports.stop();
  var settings;
  try {
    settings = await readFile(cfg_file, "utf8");
    settings = JSON.parse(settings) || {}
  } catch (e) {}
  if (!settings) return;
  var {
    enable_auto_backup,
    backup_config,
    backup_database,
    time,
    dropbox_access_token
  } = settings;


  if (!(enable_auto_backup && time && dropbox_access_token && (backup_config || backup_database))) return;

  var [input, h, m, ampm] = time.trim().match(/^(\d+)\s?\:\s?(\d+)\s?(am|pm)$/i);
  if (!h || !m) return;
  if (ampm.match(/pm/i)) h = parseInt(h) + 12;
  var rule = new schedule.RecurrenceRule;
  rule.dayOfWeek = [new schedule.Range(0, 6)];
  rule.hour = parseInt(h);
  rule.minute = parseInt(m);
  job = schedule.scheduleJob(rule, async function() {
    system_logs.create("info", `Dropbox Backup: Scheduled Job Initiated`).catch(console.log);
    var zip_path = await exports.generateBackup(settings);
    if (!zip_path) return;
    await exports.uploadToDropbox(settings, zip_path)
  })
};
exports.stop = () => {
  if (job) {
    job.cancel();
    job = null
  }
};
exports.generateBackup = async settings => {
  try {
    var {
      backup_config,
      backup_database
    } = settings;
    var filename = await backup.createZip({
      config: backup_config,
      database: backup_database
    });
    var zip_path = filename ? path.join(process.env.APPDIR, "public", "backup", filename) : "";
    return zip_path
  } catch (e) {
    system_logs.create("warn", `Dropbox Backup: Error while generating backup`).catch(console.log);
    system_logs.create("critical", `Dropbox Backup: Error while generating backup :\n${e.toString()}`).catch(console.log)
  }
};
exports.uploadToDropbox = async(settings, zip_path) => {
  try {
    const machine_id = await machine.getId()
    const {
      dropbox_access_token
    } = settings;
    await new Promise((resolve, reject) => {
      var exec = spawn(script, [machine_id, dropbox_access_token, zip_path], {
        shell: true
      });
      var error, resp;
      exec.stderr.on("data", err => {
        if (err) {
          error = error ? error + "\n" + err.toString() : err.toString()
        }
      });
      exec.on("error", err => {
        error = err.toString();
        reject(error)
      });
      exec.stdout.on("data", function(data) {
        resp += data.toString()
      });
      exec.on("close", code => {
        if (resp.match(/(content_hash|is_downloadable|\"name\")/gi)) {
          system_logs.create("info", `Dropbox Backup: Successfully uploaded`).catch(console.log);
          fs.unlink(zip_path, console.log);
          resolve(code)
        } else reject(error + "\n" + resp)
      })
    })
  } catch (e) {
    system_logs.create("warn", `Dropbox Backup: Error while uploading to Dropbox`).catch(console.log);
    system_logs.create("critical", `Dropbox Backup: Error while uploading to Dropbox :\n${e.toString()}`).catch(console.log)
  }
};