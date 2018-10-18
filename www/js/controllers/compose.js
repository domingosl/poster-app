angular.module('poster').controller('compose', function ($scope, $state, $stateParams, api, helper) {

  $scope.formData = {
    userFullName: $scope.user.firstName + " " + $scope.user.lastName,
    recipients: []
  };

  $scope.$on('$ionicView.afterEnter', function() {

    helper.loader.on();

    api.request('getRecipients').read().then(
      function success(recipients) {

        helper.loader.off();

        if(recipients.length === 0) {
          if($scope.prevStateName !== 'main.recipient')
            return $state.go('main.recipient');
          else
            return $state.go('main.messages');
        }

        $scope.formData.recipients = recipients;
        $scope.formData.recipients.push({
          _id: 'add',
          firstName: 'Aggiungi nuovo destinatario',
          lastName: ''
        });

        $scope.formData.recipient = $stateParams.recipient ? $stateParams.recipient : $scope.formData.recipients[0];

      },
      function error() {
        $scope.formData.recipients = [];
      }
    );

  });


  $scope.recipientUpdate = function () {
    if($scope.formData.recipient._id === 'add')
      $state.go('main.recipient');
  };


});
