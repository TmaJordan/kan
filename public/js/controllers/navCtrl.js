/**
 * Mainly used to keep track of which tab is selected when the user loads the app
 */
angular.module('kanApp').controller('NavController', [
    '$scope',
    '$location',
    'auth',
    function($scope, $location, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = function() {
            auth.logOut();
            $location.path('/login.html');
        }

        if ($location.path().indexOf('tasks') > 0) {
            $scope.index = 0;
        }
        else if ($location.path().indexOf('projects') > 0){
            $scope.index = 1;
        }
        else if ($location.path().indexOf('org') > 0){
            $scope.index = 2;
        }
        else if ($location.path().indexOf('reports') > 0){
            $scope.index = 3;
        }
        else {
            $scope.index = 0;
        }
    }
]);