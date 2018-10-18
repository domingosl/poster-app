angular.module('poster').service('helper', function ($ionicLoading, $ionicPopup) {

  var _self = this;

  var loaderActive = false;

  this.loader = {
    on: function () {
      if (loaderActive)
        return;
      $ionicLoading.show({
        template: '<ion-spinner class="ripple spinner-energized"></ion-spinner>'
      }).then(function () {
        if (!loaderActive)
          return;
        loaderActive = true;
      });
    },
    off: function () {
      $ionicLoading.hide().then(function () {
        loaderActive = false;
      });
    }
  };

  this.getAppEnv = function () {
    return localStorage.getItem("appenv") || "production";
  };

  this.setAppEnv = function (env) {
    return localStorage.setItem("appenv", env);
  };

  this.toggleAppEnv = function () {
    return localStorage.setItem("appenv", _self.getAppEnv() === 'production' ? 'developing' : 'production');
  };

  this.alert = function(msg) {
    $ionicPopup.alert({
      title: 'Attenzione',
      template: msg
    })
  };

  this.confirmToContinue = function (msg, cb) {

    var confirmPopup = $ionicPopup.confirm({
      title: 'Conferma',
      template: msg,
      cancelText: "Ignora"
    });

    confirmPopup.then(function(res) {
      if(res) {
        cb();
      } else {
        return;
      }
    });
  };

});

