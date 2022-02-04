"use strict";
const {machine} = require('@adopisoft/exports')

var cron = require("../cron");
var path = require("path");
var cfg_file = process.env.NODE_ENV == "development" ? path.join(__dirname, '/../../', "tmp", "dropbox-backup-creds.json") : path.join("/etc", "dropbox-backup-creds.json");
var {
  promisify
} = require("util");
var fs = require("fs");
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);
var script = path.join(__dirname, "/../../", "backup.sh");
var {
  spawn
} = require("child_process");
exports.get = async(req, res, next) => {
  try {
    var settings = await readFile(cfg_file, "utf8");
    settings = JSON.parse(settings) || {};
    res.json(settings)
  } catch (e) {
    next(e)
  }
};
exports.update = async(req, res, next) => {
  try {
    await writeFile(cfg_file, JSON.stringify(req.body || {}));
    await cron.init();
    res.json({})
  } catch (e) {
    next(e)
  }
};
exports.testSettings = async(req, res, next) => {
  try {
  	const machine_id = await machine.getId()
    const settings = await readFile(cfg_file, "utf8");
    const {
      dropbox_access_token
    } = JSON.parse(settings);
    var test_file = path.join(__dirname, "/../../", "test-file.txt");

    await new Promise((resolve, reject) => {
      var exec = spawn(script, [machine_id, dropbox_access_token, test_file, "it-works.txt"], {
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
        if (resp && resp.match(/(content_hash|is_downloadable|\"name\")/gi)) resolve(code);
        else reject(error + "\n" + resp)
      })
    });
    res.json({
      message: "It works! Check your dropbox."
    })
  } catch (e) {
    console.log("test_upload_err: ", e)
    next("Upload failed, double check your access token.")
  }
};