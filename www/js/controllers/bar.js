angular.module('poster').controller('bar', function ($scope, $window) {

  $scope.goBack = function() {
    $window.history.go(-1);
  }

});
