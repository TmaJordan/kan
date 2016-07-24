'use strict';

var kanApp = angular.module('kanApp', ['ngRoute', 'angularMoment']);

kanApp.factory('tasks', [function(){
    //Tasks Service
    var o = {
        tasks: [
            {
                _id: 1,
                title: 'Build Basic App',
                description: 'Need to develop basic app structure and learn MEAN stack',
                comments: [],
                completed: true,
                dateCreated: new Date(),
                timeStarted: new Date(),
                type: 'Development',
                dependency: -1,
                loe: '2 weeks',
                dueDate: null,
                assignee: 'tjordan',
                createdBy: 'tjordan',
                links: []
            },
            {
                _id: 2,
                title: 'Meet with Ruairi',
                description: 'Need to meet with Ruairi once he is back from vacation',
                comments: [],
                completed: false,
                dateCreated: new Date(),
                timeStarted: new Date(),
                type: 'Development',
                dependency: -1,
                loe: '2 weeks',
                dueDate: null,
                assignee: 'tjordan',
                createdBy: 'tjordan',
                links: [
                    {
                        title: "Email from Ruari",
                        link: "https://inbox.google.com/u/0/?pli=1"
                    }
                ]
            },
            {
                _id: 3,
                title: 'Finish app',
                description: 'Need to finish out app and test it against real users',
                comments: [],
                completed: false,
                dateCreated: new Date(),
                timeStarted: new Date(),
                type: 'Development',
                dependency: 1,
                loe: '2 weeks',
                dueDate: null,
                assignee: 'tjordan',
                createdBy: 'tjordan',
                links: [
                    {
                        title: "Back end issue",
                        link: "https://github.com/TmaJordan/kan/issues/2"
                    },
                    {
                        title: "Angular Docs",
                        link: "https://docs.angularjs.org/guide"
                    }
                ]
            }
        ]
    };

    //Will be replaced by $http route when api is built
    o.get = function(id) {
        for (var i = 0; i < o.tasks.length; i++) {
            if (o.tasks[i]._id == id) {
                return o.tasks[i];
            }
        }
    };

    o.update = function(task) {
        return task;
    }

    o.newTaskTitle = "New Task";
    
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
        .when('/tasks/:id', {
            templateUrl: 'templates/task.html',
            controller: 'TaskController'
        })
        .when('/projects.html', {
            templateUrl: 'templates/projects.html',
            controller: 'ProjectsController'
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
    '$timeout',
    'tasks', 
    function TasksController($scope, $timeout, tasks) {
        $scope.views = [
            {title: "My Tasks"},
            {title: "Today's Tasks"},
            {title: "Other Tasks"},
            {title: "Project Tasks"},
            {title: "Completed Tasks"}
        ];
        $scope.selectedView = $scope.views[0].title;

        $scope.updateView = function() {
            console.log($scope.selectedView);
        }
        
        $scope.tasks = tasks.tasks;
        $scope.task = {};
        
        $scope.popup = {
            show: false,
            text: '',
            action: ''
        };
        var hidePromise;
        $scope.toggleCompleted = function(task) {
            $scope.task = task;
            console.log(task.title + " is " + (task.completed ? "Complete": "Not Complete"));
            $scope.popup.text = task.title + " is " + (task.completed ? "Complete": "Not Complete");
            $scope.popup.show = true;
            hidePromise = $timeout(function(){
                $scope.popup.show = false; 
            }, 5000);
        }

        $scope.undo = function() {
            $scope.task.completed = !$scope.task.completed;
            $scope.popup.show = false;
            $timeout.cancel(hidePromise)
        }

        $scope.editTask = function(task) {
            console.log("Edit: " + task.title);
        }

        $scope.addTask = function() {
            var task = {
                _id: Date.now(),
                title: tasks.newTaskTitle,
                dateCreated: new Date(),
                timeStarted: new Date(),
                type: '',
                dependency: 0,
                loe: '',
                dueDate: null,
                assignee: '',
                createdBy: '',
                comments: [],
                links: [],
                completed: false
            }
            $scope.tasks.unshift(task);
            console.log("New Task Created")
        }
    }
]);

kanApp.controller('TaskController', [
    '$scope',
    '$routeParams',
    'tasks',
    function($scope, $routeParams, tasks) {
        $scope.task = tasks.get($routeParams.id);

        if ($scope.task.title === tasks.newTaskTitle) {
            $scope.viewMode = "edit";
        }
        else {
            $scope.viewMode = "view";
        }

        $scope.edit = function() {
            $scope.viewMode = "edit";
        }

        $scope.addComment = function() {
            console.log("Adding Comment: " + $scope.commentBody);
            if ($scope.commentBody === '') {return;}
            
            //Add in other comment info
            var comment = {
                body: $scope.commentBody,
                author: 'currentuser',
                dateCreated: new Date()
            }

            $scope.task.comments.push(comment);
            
            $scope.commentBody = '';
        }

        $scope.saveEdit = function() {
            //Need to save
            tasks.update($scope.task);
            $scope.viewMode = "view";
        }
    }
])

kanApp.controller('ProjectsController', [
    '$scope',
    function ProjectsController($scope) {
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