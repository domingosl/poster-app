angular.module('poster').controller('welcome', function ($rootScope, $scope, api, $state, helper, $window, $timeout) {


  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.ui = {
      showLogo: false,
      showFooter: false,
      env: helper.getAppEnv()
    };
  });

  $scope.$on('$ionicView.afterEnter', function() {
    $scope.ui.showLogo = true;

    var session = api.session();

    if(!session)
      $scope.ui.showFooter = true;
    else {

      api.request('getUser', session.user.id).read().then(
        function success(user) {
          $rootScope.user = user;
          $state.go('main.messages');
        },
        function error() {
          $scope.ui.showFooter = true;
        }
      );


    }

  });

  $scope.$on('$ionicView.afterLeave', function() {
    $scope.ui.showLogo = false;
    $scope.ui.showFooter = false;
  });

  var changeEnvCounter = 0;
  var envTimeoutPromise = null;
  $scope.changeEnv = function () {

    changeEnvCounter++;

    if(envTimeoutPromise)
      $timeout.cancel(envTimeoutPromise);

    if(changeEnvCounter >= 4) {
      helper.toggleAppEnv();
      helper.loader.on();
      $window.location.href = '/';
    }

    envTimeoutPromise = $timeout(function () {
      changeEnvCounter = 0;
    }, 500);

  };


});
