angular.module('kanApp').controller('AuthController', [
    '$scope',
    '$location',
    'auth',
    function($scope, $location, auth) {
        $scope.user = {};

        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $location.path('/index.html');
            });
        }

        $scope.logIn = function() {
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $location.path('/index.html');
            });
        }
    }
]);
