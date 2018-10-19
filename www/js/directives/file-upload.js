angular.module('poster').directive('fileUpload', function () {

  return {
    link: function($scope, el) {

      el.bind("change", function(e){
        var file = (e.srcElement || e.target).files[0];
        $scope.getFile(file, e.target.id);
        el.val(null);
      })

    }

  }

});
