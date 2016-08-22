angular.module('kanApp').factory('Reports', ['$http', 'auth', function($http, auth){
    //Users Service
    var Reports = {
        userStats: {}
    };

    Reports.getUserStats = function(username) {
        return $http.get('/api/reports/users/' + username, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).then(function(res) {
            angular.copy(res.data, Reports.userStats);
            return res.data;
        });
    };

    return Reports; 
}]);