'use strict';

var kanApp = angular.module('kanApp', ['ngRoute']);

kanApp.config(function($routeProvider) {
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
});

kanApp.controller('TasksController', function TasksController($scope) {
   $scope.tasks = [
       {
           title: 'Build Basic App'
       },
       {
           title: 'Meet with Ruairi'
       },
       {
           title: 'Finish app'
       }
   ];
});

kanApp.controller('ProjectController', function ProjectController($scope) {
    $scope.projects = [
        {
            title: 'Kan App'
        }
    ]
});

kanApp.controller('OrgController', function OrgController($scope) {
    $scope.users = [
        {
            username: 'tjordan'
        }
    ]
});

kanApp.controller('ReportsController', function ReportsController($scope) {
    $scope.reports = [
        {
            type: 'Burndown'
        }
    ]
});