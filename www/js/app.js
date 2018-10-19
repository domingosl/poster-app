angular.module('poster', ['ionic', 'ngFx', 'ngFileUpload'])

  .config(function ($stateProvider, $locationProvider, $urlRouterProvider, $ionicConfigProvider ) {

    //$locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/welcome');
    $ionicConfigProvider.backButton.text('');

    $stateProvider
      .state('welcome',
        {
          url: '/welcome',
          templateUrl: 'templates/welcome.html',
          controller: 'welcome'
        })
      .state('login',
        {
          url: '/login',
          templateUrl: 'templates/login.html',
          controller: 'login'
        })
      .state('userRegistration',
        {
          url: '/user-registration',
          templateUrl: 'templates/registration.html',
          controller: 'userRegistration'
        })
      .state('main',
        {
          abstract: true,
          cache: false,
          url: '/main',
          templateUrl: 'templates/main.html',
          controller: 'main'
        }
      )
      .state('main.messages',
      {
        url: '/messages',
        views: {
          'menuContent': {
            templateUrl: 'templates/messages.html',
            controller: ''
          }
        }
      }
    )
      .state('main.drafts',
        {
          url: '/drafts',
          views: {
            'menuContent': {
              templateUrl: 'templates/drafts.html',
              controller: ''
            }
          }
        }
      )

      .state('main.recipients',
        {
          url: '/recipients',
          views: {
            'menuContent': {
              templateUrl: 'templates/recipients.html',
              controller: ''
            }
          }
        }
      )
      .state('main.recipient',
        {
          url: '/recipient',
          views: {
            'menuContent': {
              templateUrl: 'templates/recipient.html',
              controller: 'recipient'
            }
          }
        }
      )
      .state('main.compose',
        {
          url: '/compose',
          params: { recipient: null },
          views: {
            'menuContent': {
              templateUrl: 'templates/compose.html',
              controller: 'compose'
            }
          }
        }
      )

  })
  .run(function ($ionicPlatform, api, $ionicPopup, helper) {

    $ionicPlatform.ready(function () {
      if (window.cordova && window.Keyboard) {
        window.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

    });

    var alertMsg = function (response) {
      $ionicPopup.alert({
        title: 'Errore',
        template: response.message
      })
    };

    api.initialize({
      env: helper.getAppEnv(),
      errorHandlers: {
        401: function () {
          console.log("drop session!");
        },
        403: alertMsg,
        429: alertMsg,
        500: function () {
          alertMsg("Errore!!!")
        },

      }
    });


  });
