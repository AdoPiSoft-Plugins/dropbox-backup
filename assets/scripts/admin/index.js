(function () {
  'use strict';
  var App = angular.module('Plugins')
  .config(function($stateProvider) {
    $stateProvider
    .state('plugins.dropbox_backup', {
      templateUrl : "/plugins/dropbox-backup/views/admin/index.html",
      controller: 'DropboxBackupPluginCtrl',
      url: '/dropbox-backup-plugin',
      title: 'Dropbox Backup'
    });
  });
})();
