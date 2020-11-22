'use strict';
var path = require("path")
var cfg_file = path.join(process.env.APPDIR, "plugins", "dropbox-backup", "settings.json")
var { promisify } = require('util')
var fs = require('fs')
var writeFile = promisify(fs.writeFile)
var readFile = promisify(fs.readFile)

exports.get = async(req, res, next)=>{
  try{
    var settings = await readFile(cfg_file, 'utf8')
    settings = JSON.parse(settings);
    res.json(settings || {})
  }catch(e){
    next(e)
  }
}

exports.update = async(req, res, next)=>{
  try{
    await writeFile(cfg_file, JSON.stringify(req.body||{}));
    res.json({})
  }catch(e){
    next(e)
  }
}

exports.testSettings = async(req, res, next)=>{
  res.json({message: "Success"})
}