angular.module('poster').controller('recipient', function ($scope, $rootScope, $state, api, helper) {

  $scope.formData = {};
  $scope.formErrors = {};

  $rootScope.$on('jail-selected', function (e, jail) {
    $scope.formData.jail = jail;
  });

  $scope.doSaveRecipient = function () {

    helper.loader.on();

    $scope.formErrors = {};

    api.request('setRecipient').save({
      firstName: $scope.formData.firstName,
      lastName: $scope.formData.lastName,
      jail: $scope.formData.jail ? $scope.formData.jail._id : null
    }).then(
      function success(recipient) {
        helper.loader.off();
        $scope.formData = {};
        $state.go('main.compose', { recipient: recipient });
      },
      function error(err) {
        helper.loader.off();
        if(err.code === 400) {
          $scope.formErrors = err.data;
        }
      }
    )


  }

});
