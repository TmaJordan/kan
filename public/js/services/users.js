angular.module('kanApp').factory('Users', ['$http', 'auth', function($http, auth){
    //Users Service
    var Users = {
        users: []
    };

    Users.getAll = function() {
        return $http.get('/api/users', {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
           angular.copy(data, Users.users);
        });
    };

    Users.update = function(user) {
        return $http.put('/api/users/' + user._id, user, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
            for (var i = 0; i < Users.users.length; i++) {
                if (Users.users[i]._id == data._id) {
                    //Update local array
                    Users.users[i] = data;
                }
            }
            return data;
        });
    };

    Users.delete = function(id) {
        return $http.delete('/api/users/' + id, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).then(function(res) {
            for (var i = 0; i < Users.users.length; i++) {
                if (Users.users[i]._id == id) {
                    //Remove user from local array
                    Users.users.splice(i, 1);
                }
            }
            return res.data;
        });
    };

    return Users; 
}]);