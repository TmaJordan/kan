/**
 * Using localstorage to save json web token
 */
angular.module('kanApp').factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};
    
    auth.saveToken = function(token) {
        $window.localStorage['kan-app-token'] = token;
    }
    
    auth.getToken = function() {
        return $window.localStorage['kan-app-token'];
    }

    auth.logOut = function(user) {
        $window.localStorage.removeItem('kan-app-token');
    }
    
    auth.isLoggedIn = function() {
        var token = auth.getToken();
        
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.exp > Date.now() / 1000;
        }
        else {
            return false;
        }
    }

    auth.currentUser = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    }

    auth.register = function(user) {
        return $http.post('api/users/register', user).success(function(data) {
            auth.saveToken(data.token);
        });
    }
    
    auth.logIn = function(user) {
        return $http.post('api/users/login', user).success(function(data) {
            auth.saveToken(data.token);
        });
    }

    return auth;
}]);