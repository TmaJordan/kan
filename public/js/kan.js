'use strict';

var kanApp = angular.module('kanApp', ['ngRoute']);

kanApp.factory('tasks', [function(){
    //Tasks Service
    var o = {
        tasks: [
            {
                title: 'Build Basic App',
                completed: true
            },
            {
                title: 'Meet with Ruairi',
                completed: false
            },
            {
                title: 'Finish app',
                completed: false
            }
        ]
    };
    
    return o; 
}]);

kanApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/tasks.html',
            controller: 'TasksController'
        })
        .when('/index.html', {
            templateUrl: 'templates/tasks.html',
            controller: 'TasksController'
        })
        .when('/projects.html', {
            templateUrl: 'templates/projects.html',
            controller: 'ProjectController'
        })
        .when('/org.html', {
            templateUrl: 'templates/organisation.html',
            controller: 'OrgController'
        })
        .when('/reports.html', {
            templateUrl: 'templates/reports.html',
            controller: 'ReportsController'
        });

    $locationProvider.html5Mode(true);
});

kanApp.controller('TasksController', [
    '$scope',
    'tasks', 
    function TasksController($scope, tasks) {
        $scope.tasks = tasks.tasks;

        $scope.toggleCompleted = function(task) {
            console.log(task.title + " is " + (task.completed ? "Complete": "Not Complete"));
        }

        $scope.editTask = function(task) {
            console.log("Edit: " + task.title);
        }

        $scope.addTask = function() {
            var task = {
                title: 'New Task',
                completed: false
            }
            $scope.tasks.unshift(task);
        }
    }
]);

kanApp.controller('ProjectController', [
    '$scope',
    function ProjectController($scope) {
        $scope.projects = [
            {
                title: 'Kan App'
            }
        ]
    }
]);

kanApp.controller('OrgController', [
    '$scope',
    function OrgController($scope) {
        $scope.users = [
            {
                username: 'tjordan'
            }
        ]
    }
]);

kanApp.controller('ReportsController', [
    '$scope',
    function ReportsController($scope) {
        $scope.reports = [
            {
                type: 'Burndown'
            }
        ]
    }
]);