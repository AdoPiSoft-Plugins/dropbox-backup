(function () {
  'use strict';

  var App = angular.module('Plugins')
  App.service('DropboxBackupService', [
    '$http',
    'toastr',
    'CatchHttpError',
    '$q',
    function($http, toastr, CatchHttpError, $q) {
      this.get = function () {
        return $http.get("/dropbox-backup/settings")
      }

      this.update = function (data) {
        return $http.post("/dropbox-backup/settings", data)
      }

      this.testSettings = function () {
        return $http.post("/dropbox-backup/test-settings")
      }
    }
  ])

  App.controller('DropboxBackupPluginCtrl', function($scope, DropboxBackupService, SettingsSavedToastr, toastr, CatchHttpError, $timeout, $ngConfirm){
    $scope.ampms = ['AM', 'PM'];
    $scope.ampm = 'AM';
    $scope.hours = [];
    for (var h=0; h < 12; h++) {
      $scope.hours.push(h+"");
    }
    $scope.mins = [];
    for (var m=0; m < 60; m+=1) {
      var _m = m+""
      if(m < 10) _m = "0"+_m;
      $scope.mins.push(_m);
    }

    $scope.setTime = function(){
      var minute = $scope.minute+""
      if(!minute.length)
        minute = "00";
      if(minute.length == 1)
        minute = "0"+minute;

      $scope.time = [$scope.hour, minute].join(":") + " " + $scope.ampm
    }

    DropboxBackupService.get().then(function(resp){
      var data = resp.data || {}
      $scope.enable_auto_backup = data.enable_auto_backup
      $scope.dropbox_access_token = data.dropbox_access_token
      $scope.time = data.time
      var input;
      [input, $scope.hour, $scope.minute, $scope.ampm] = (data.time||"").match(/^(\d+)\s?\:\s?(\d+)\s?(am|pm)$/i)

      $scope.backup_config = data.backup_config
      $scope.backup_database = data.backup_database
    })

    $scope.updateSettings = function(){
      return DropboxBackupService.update({
        enable_auto_backup: $scope.enable_auto_backup,
        dropbox_access_token: $scope.dropbox_access_token,
        backup_config: $scope.backup_config,
        backup_database: $scope.backup_database,
        time: $scope.time,
      })
      .then(SettingsSavedToastr)
      .catch(CatchHttpError)
    }

    $scope.testSettings = function(){
      return DropboxBackupService.testSettings().then(function(resp){
        var data = resp.data
        toastr.success(data.message)
      }).catch(CatchHttpError)
    }

    $scope.hasValidConfig = function(){
      return $scope.dropbox_access_token && $scope.time && ($scope.backup_config || $scope.backup_database)
    }
  })

})();