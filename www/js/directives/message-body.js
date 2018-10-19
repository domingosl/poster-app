angular.module('poster').directive('messageBody', function () {
  return {
    restrict: 'AE',
    link: function (scope, element, attrs) {

      element.bind("keypress", function (event) {

        element.css('height', 0);
        var size = 10 + element[0].scrollHeight + "px";
        element.css('height', size);


      });

    }
  }
});
