angular.module('poster').controller('compose', function ($scope, $state, $stateParams, api, helper, $window, Upload) {

  $scope.formData = {
    userFullName: $scope.user.firstName + " " + $scope.user.lastName,
    recipients: []
  };

  $scope.formData.totalChars = 5000;
  $scope.formData.charsLeft = $scope.formData.totalChars;

  $scope.updateCharsLeft = function () {
    $scope.formData.charsLeft = $scope.formData.totalChars - $scope.formData.body.length;
  };

  $scope.getFile = function (file, id) {
    console.log(file, id);

    Upload.upload({
      url: api.getFullUrl('saveMessageImage', []),
      data: {file: file}
    })
      .then(
        function (resp) {
          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        },
        function (resp) {
          console.log('Error status: ' + resp.status);
        },
        function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });

  };

  angular.element(document.querySelector('#message-body')).css('height', $window.innerHeight - 275 + "px");

  $scope.$on('$ionicView.beforeEnter', function () {

    helper.loader.on();

    api.request('getRecipients').read().then(
      function success(recipients) {

        helper.loader.off();

        if (recipients.length === 0) {
          if ($scope.prevStateName !== 'main.recipient')
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
    if ($scope.formData.recipient._id === 'add')
      $state.go('main.recipient');
  };


});
