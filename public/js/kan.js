'use strict';

angular.module('kanApp', ['ngRoute', 'angularMoment', '720kb.datepicker']);

angular.module('kanApp').factory('Tasks', ['$http', function($http){
    //Tasks Service
    var Tasks = {
        tasks: []
    };

    Tasks.getAll = function() {
        return $http.get('/api/tasks').success(function(data) {
           angular.copy(data, Tasks.tasks);
        });
    };

    //Will be replaced by $http route when api is built
    Tasks.get = function(id) {
        return $http.get('/api/tasks/' + id).then(function(res) {
            return res.data;
        });
    };

    Tasks.create = function(task) {
        return $http.post('/api/tasks', task).success(function(data) {
           Tasks.tasks.unshift(data); 
        });
    };

    Tasks.update = function(task) {
        return $http.put('/api/tasks/' + task._id, task).success(function(data) {
            for (var i = 0; i < Tasks.tasks.length; i++) {
                if (Tasks.tasks[i]._id == data._id) {
                    Tasks.tasks[i] = data;
                }
            }
        });
    };

    Tasks.addComment = function(id, comment) {
        return $http.post('/api/tasks/' + id + '/comments', comment);
    }

    Tasks.newTaskTitle = "New Task";
    
    return Tasks; 
}]);

angular.module('kanApp').factory('Sounds', [function(){
    var Sounds = {
        ding: new Audio('audio/ding.wav')
    }
    
    Sounds.play = function(soundName) {
        if (Sounds[soundName]) {
            Sounds[soundName].play();
        }
    }

    return Sounds;
}]);

angular.module('kanApp').config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/tasks.html',
            controller: 'TasksController',
            resolve: {
                tasks: ['Tasks', function(Tasks) {
                    return Tasks.getAll();
                }]
            }
        })
        .when('/index.html', {
            templateUrl: 'templates/tasks.html',
            controller: 'TasksController',
            resolve: {
                tasks: ['Tasks', function(Tasks) {
                    return Tasks.getAll();
                }]
            }
        })
        .when('/tasks/:id', {
            templateUrl: 'templates/task.html',
            controller: 'TaskController',
            resolve: {
                task: ['$route','Tasks', function($route, Tasks) {
                    return Tasks.get($route.current.params.id);
                }]
            }
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

angular.module('kanApp').controller('TasksController', [
    '$scope',
    '$timeout',
    '$location',
    'Tasks', 
    'Sounds',
    function TasksController($scope, $timeout, $location, Tasks, Sounds) {
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
        
        $scope.tasks = Tasks.tasks;
        $scope.task = {};
        
        //Popup that will be displayed so that users can undo completing a task
        $scope.popup = {
            show: false,
            text: '',
            action: ''
        };
        var hidePromise;
        $scope.toggleCompleted = function(task) {
            Tasks.update(task);
            $scope.task = task;
            Sounds.play('ding');
            //Set contents of undo popup
            $scope.popup.text = task.title + " is " + (task.completed ? "Complete": "Not Complete");
            $scope.popup.show = true;
            hidePromise = $timeout(function(){
                $scope.popup.show = false; 
            }, 5000);
        }

        $scope.undo = function() {
            $scope.task.completed = !$scope.task.completed;
            $scope.popup.show = false;
            Tasks.update($scope.task);
            $timeout.cancel(hidePromise)
        }

        $scope.editTask = function(task) {
            console.log("Edit: " + task.title);
        }

        $scope.addTask = function() {
            var task = {
                title: Tasks.newTaskTitle,
            }
            Tasks.create(task).success(function(task) {
                $location.path('/tasks/' + task._id);
            });
            console.log("New Task Created")
        }
    }
]);

angular.module('kanApp').controller('TaskController', [
    '$scope',
    '$routeParams',
    'Tasks',
    'task',
    function($scope, $routeParams, Tasks, task) {
        $scope.task = task;
        console.log(JSON.stringify($scope.task));
        
        if ($scope.task.title === Tasks.newTaskTitle) {
            $scope.viewMode = "edit";
            $scope.backup = angular.copy($scope.task);
        }
        else {
            $scope.viewMode = "view";
        }

        $scope.edit = function() {
            $scope.viewMode = "edit";
            $scope.backup = angular.copy($scope.task);
        }

        $scope.addComment = function() {
            console.log("Adding Comment: " + $scope.commentBody);
            if ($scope.commentBody === '') {return;}
            
            //Add in other comment info
            var comment = {
                body: $scope.commentBody,
                author: 'tjordan',
                dateCreated: new Date()
            }
            Tasks.addComment(task._id, comment).success(function(comment) {
               $scope.task.comments.push(comment); 
            });
            
            $scope.commentBody = '';
        }

        $scope.saveEdit = function() {
            //Need to save
            Tasks.update($scope.task);
            $scope.viewMode = "view";
        }

        $scope.cancel = function() {
            $scope.viewMode = "view";
            $scope.task = angular.copy($scope.backup);
        }
    }
])

angular.module('kanApp').controller('ProjectsController', [
    '$scope',
    function ProjectsController($scope) {
        $scope.projects = [
            {
                title: 'Kan App'
            }
        ]
    }
]);

angular.module('kanApp').controller('OrgController', [
    '$scope',
    function OrgController($scope) {
        $scope.users = [
            {
                username: 'tjordan'
            }
        ]
    }
]);

angular.module('kanApp').controller('ReportsController', [
    '$scope',
    function ReportsController($scope) {
        $scope.reports = [
            {
                type: 'Burndown'
            }
        ]
    }
]);