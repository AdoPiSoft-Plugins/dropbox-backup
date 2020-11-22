'use strict';
var { router, middlewares } = require('../core')
var settings_ctrl = require("./controllers/settings_ctrl")
var { bodyParser } = middlewares

router.get('/dropbox-backup/settings', bodyParser.json(), settings_ctrl.get)

router.post('/dropbox-backup/settings', bodyParser.json() ,settings_ctrl.update)

router.post('/dropbox-backup/test-settings', settings_ctrl.testSettings)

module.exports = router