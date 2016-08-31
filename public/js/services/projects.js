angular.module('kanApp').factory('Projects', ['$http', '$window', 'auth', function($http, $window, auth){
    //Projects Service
    var Projects = {
        projects: []
    };

    Projects.getAll = function() {
        return $http.get('/api/projects', {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
           angular.copy(data, Projects.projects);
        });
    };

    Projects.get = function(id) {
        return $http.get('/api/projects/' + id, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).then(function(res) {
            return res.data;
        });
    };

    Projects.update = function(project) {
        return $http.put('/api/projects/' + project._id, project, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
            for (var i = 0; i < Projects.projects.length; i++) {
                if (Projects.projects[i]._id == data._id) {
                    //Update local array
                    Projects.projects[i] = data;
                }
            }
        });
    };

    Projects.delete = function(id) {
        return $http.delete('/api/projects/' + id, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).then(function(res) {
            for (var i = 0; i < Projects.projects.length; i++) {
                if (Projects.projects[i]._id == id) {
                    //Remove from local array
                    Projects.projects.splice(i, 1);
                }
            }
            return res.data;
        });
    };

    Projects.create = function(project) {
        return $http.post('/api/projects', project, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
           Projects.projects.push(data); 
        });
    };

    Projects.export = function(project) {
        return $http.get('/api/projects/' + project._id + '/export', {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(url) {
            console.log(url);
            $window.open(url); 
        });
    }

    Projects.newProjectTitle = "New Project";

    return Projects; 
}]);
