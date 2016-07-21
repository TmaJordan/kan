'use strict';

var kanApp = angular.module('kanApp', ['ngRoute']);

kanApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/tasks.html',
            controller: 'TasksController'
        })
        .when('/projects', {
            templateUrl: 'templates/projects.html',
            controller: 'ProjectController'
        })
        .when('/org', {
            templateUrl: 'templates/organisation.html',
            controller: 'OrgController'
        })
        .when('/reports', {
            templateUrl: 'templates/reports.html',
            controller: 'ReportsController'
        });

    $locationProvider.html5Mode(true);
});

kanApp.controller('TasksController', [
    '$scope', 
    function TasksController($scope) {
        $scope.tasks = [
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
        ];

        $scope.toggleCompleted = function(task) {
            alert(task.title + " is " + (task.completed ? "Complete": "Not Complete"));
        }

        $scope.editTask = function(task) {
            alert("Edit: " + task.title);
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