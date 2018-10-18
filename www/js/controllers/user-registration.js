angular.module('poster').controller('userRegistration', function ($scope, api, helper) {

  $scope.formData = {};

  $scope.doUserRegistration = function () {

    helper.loader.on();

    var payload = {
      email: $scope.formData.email,
      firstName: $scope.formData.firstName,
      lastName: $scope.formData.lastName,
      username: $scope.formData.email,
      password: $scope.formData.password
    };

    api.request('user_registration').save(payload).then(successUserRegistration, failUserRegistration);

  };


  function successUserRegistration(user) {
    helper.loader.off();
    console.log(user);
  }

  function failUserRegistration(err) {
    helper.loader.off();
    console.log(err);
  }

});
