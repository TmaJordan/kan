'use strict';

var kanApp = angular.module('kanApp', []);

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