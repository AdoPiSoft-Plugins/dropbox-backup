"use strict";
const router = require("./router");
const cron = require("./cron.js");
const {app} = require('@adopisoft/exports')

module.exports = {
  async init() {
    app.use(router);
    cron.init().catch(console.log)
  }
};