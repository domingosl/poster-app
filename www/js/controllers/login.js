angular.module('poster').controller('login', function ($rootScope, $scope, $state, api, helper, $ionicPopup, $timeout) {

  $scope.formData = {
    email: api.getLastEmail(),
    password: ""
  };

  $scope.formErrors = {};
  $scope.resetPasswordForm = {
    email: api.getLastEmail()
  };

  $scope.doLogin = function () {

    helper.loader.on();
    $scope.formErrors = {};

    api.authenticate($scope.formData.email, $scope.formData.password).then(
      function loginSuccess(response) {

        api.setSession({
          token: response.token,
          user: response.user
        });

        api.request('getUser', response.user.id).read().then(
          function success(user) {
            $rootScope.user = user;
            $state.go('main.messages');
            $scope.formData.password = "";
            helper.loader.off();
          },
          function error() {
            helper.loader.off();
          }
        );

      },
      function err(err) {

        if(err.code === 400) {
          $scope.formErrors = err.data;
        }

        helper.loader.off();


      }
    );

  };

  $scope.openResetPasswordModal = function () {

    $scope.resetPasswordForm = {};

    $ionicPopup.show({
      template: '<input type="email" class="text-center" ng-model="resetPasswordForm.email">',
      title: 'Reset della password',
      subTitle: 'Si prega di scrivere la mail con la quale ti sei registrato',
      scope: $scope,
      buttons: [
        { text: 'Ignora' },
        {
          text: '<b>Procedi</b>',
          type: 'button-positive',
          onTap: function(e) {

            if (!$scope.resetPasswordForm.email) {
              e.preventDefault();
            } else {

              helper.loader.on();

              return api.request('resetPassword').save($scope.resetPasswordForm).then(
                function success() {
                  $timeout(function () {

                    helper.loader.off();

                    $ionicPopup.alert({
                      title: 'Fatto!',
                      template: 'Ti abbiamo inviato una nuova password alla tua mail.'
                    });

                  }, 500);

                },
                function error() {
                  helper.loader.off();
                }
              )

            }
          }
        }
      ]
    });

  }

});
