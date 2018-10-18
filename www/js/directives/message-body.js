angular.module('poster').directive('messageBody', function () {
  return {
    restrict: 'AE',
    link: function (scope, element, attrs) {

      element.bind("keydown keypress", function (event) {

        scope.$apply(function() {
          element.css('height', "1px");
          element.css('height', 18 + element[0].scrollHeight + "px");
        });

      });

    }
  }
});
