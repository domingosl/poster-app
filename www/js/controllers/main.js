angular.module('poster').controller('main', function ($rootScope, $scope, $state, $ionicModal, api, helper) {


  if(!$rootScope.user)
    return $state.go('welcome');

  $scope.stateName = $state.current.name;

  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
      $scope.stateName = toState.name;
      $scope.prevStateName = fromState.name;
    });

  var doLogout = function () {
    helper.loader.on();
    api.logout().then(
      function () {
        helper.loader.off();
        $state.go('welcome');
      }
    ).catch(
      function () {
        helper.loader.off();
      }
    )

  };

  $scope.confirmLogout = function () {
    helper.confirmToContinue("Sicuro di voler uscire?", doLogout);
  };

  $scope.genAvatar = function (user, size) {

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = size;
    var height = size;
    var devicePixelRatio = Math.max(window.devicePixelRatio, 1);
    var initials = user.firstName.substring(0,1).toUpperCase() + user.lastName.substring(0,1).toUpperCase();
    var fontFamily = "-apple-system,system-ui,BlinkMacSystemFont, Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif";
    var fontWeight = 300;
    var fgColor = "#ffffff";
    var bgColor = "#000000";

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = "".concat(width, "px");
    canvas.style.height = "".concat(height, "px");
    context.scale(devicePixelRatio, devicePixelRatio);
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = bgColor;
    context.fill();
    context.font = "".concat(fontWeight, " ").concat(height / 2, "px ").concat(fontFamily);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = fgColor;
    context.fillText(initials, width / 2, height / 2);
    return canvas.toDataURL('image/png');

  };

  $ionicModal.fromTemplateUrl('templates/modals/user.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $rootScope.userModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/modals/jails.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $rootScope.jailsModal = modal;
  });

});
