"use strict";
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const settings_ctrl = require("./controllers/settings_ctrl");

router.get("/dropbox-backup/settings", bodyParser.json(), settings_ctrl.get);
router.post("/dropbox-backup/settings", bodyParser.json(), settings_ctrl.update);
router.post("/dropbox-backup/test-settings", settings_ctrl.testSettings);

module.exports = router;