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
        return $http.get("/dropbox-backup/settings").catch(function(){});
      }

      this.update = function (data) {
        return $http.post("/dropbox-backup/settings", data).catch(function(){});
      }

      this.testSettings = function () {
        return $http.post("/dropbox-backup/test-settings").catch(function(){});
      }
    }
  ])

  App.controller('DropboxBackupPluginCtrl', function($scope, DropboxBackupService, SettingsSavedToastr, toastr, CatchHttpError, $timeout, $ngConfirm){
    function formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }

    function strTimeToDate(str) {
      if(!str) return ""
      str = str.trim()
      var d = new Date()
      try{
        var [input, h, m, ampm] = str.match(/(\d+)\:(\d+)\s?(am|pm)/i)
        if(m.match(/pm/i)){
          h += 12
        }
        d.setHours(h)
        d.setMinutes(m)
        d.setSeconds(0)
        d.setMilliseconds(0)
      }catch(e){}
      return d
    }

    DropboxBackupService.get().then(function(resp){
      var data = resp.data || {}
      $scope.dropbox_access_token = data.dropbox_access_token
      $scope.time = strTimeToDate(data.time)
      $scope.backup_config = data.backup_config
      $scope.backup_database = data.backup_database
    })

    $scope.updateSettings = function(){
      return DropboxBackupService.update({
        dropbox_access_token: $scope.dropbox_access_token,
        backup_config: $scope.backup_config,
        backup_database: $scope.backup_database,
        time: formatAMPM($scope.time),
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
