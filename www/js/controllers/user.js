angular.module('poster').controller('user', function ($rootScope, $scope, helper, api, $ionicPopup, $timeout) {

  $scope.formData = $rootScope.user;
  $scope.changePwdForm = {};
  $scope.formErrors = {};
  $scope.pwdFormErrors = {};


  $scope.doUpdateUser = function () {

    helper.loader.on();
    $scope.formErrors = {};

    api.request('setUser', $rootScope.user._id).update($scope.formData).then(
      function userUpdated() {

        $scope.formData.oldPassword = "";
        $scope.formData.password = "";

        helper.loader.off();
        $rootScope.userModal.hide();

        $timeout(function () {
          helper.alert("I tuoi dati sono stati aggiornati correttamente. Future lettere verranno instestate con questi dati.");
        }, 1000);


      },
      function updateFail(err) {

        if(err.code === 400) {
          $scope.formErrors = err.data;
        }

        helper.loader.off();
      }
    );


  };

  $scope.changePasswordPopup = function () {

    $scope.pwdFormErrors = {};

    var popup = $ionicPopup.show({
      templateUrl: 'templates/popups/password-change.html',
      title: 'Aggiornamento password',
      subTitle: 'Inserisci la tua password corrente è la nuova',
      scope: $scope,
      buttons: [
        { text: 'Ignora' },
        {
          text: '<b>Aggiorna</b>',
          type: 'button-positive',
          onTap: function(e) {

            e.preventDefault();
            $scope.pwdFormErrors = {};

            helper.loader.on();
            api.request('changePassword').save($scope.changePwdForm).then(
              function passwordChanged(response) {
                popup.close();
                $timeout(function() {
                  helper.loader.off();
                  helper.alert("Password aggiornata");
                }, 1000);
              },
              function error(err) {

                if(err.code === 400)
                  $scope.pwdFormErrors = err.data;

                helper.loader.off();
              }
            );



          }
        }
      ]
    });

  }

});
