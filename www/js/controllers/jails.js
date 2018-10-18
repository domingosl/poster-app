angular.module('poster').controller('jails', function ($scope, $rootScope, api) {

  $scope.jails = [];

  api.request('getJails').read().then(
    function success(jails) {
      $scope.jails = jails;
    }
  );

  $scope.selectJail = function (jail) {
    $rootScope.$emit('jail-selected', jail);
    $scope.jailsModal.hide();
  }


});
