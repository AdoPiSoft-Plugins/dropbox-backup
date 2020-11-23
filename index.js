'use strict';
var router = require("./router")
var cron = require("./cron.js")

var { app } = require('../core')

module.exports = {
  async init(){
    app.use(router)
    cron.init().catch(console.log)
  }
}
