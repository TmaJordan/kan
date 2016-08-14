'use strict';

angular.module('kanApp', ['ngRoute', 'angularMoment', '720kb.datepicker', 'ang-drag-drop']);

angular.module('kanApp').factory('Tasks', ['$http', 'auth', function($http, auth){
    //Tasks Service
    var Tasks = {
        tasks: []
    };

    Tasks.getAll = function() {
        return $http.get('/api/tasks', {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
           angular.copy(data, Tasks.tasks);
        });
    };

    Tasks.get = function(id) {
        return $http.get('/api/tasks/' + id, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).then(function(res) {
            return res.data;
        });
    };

    Tasks.delete = function(id) {
        return $http.delete('/api/tasks/' + id, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).then(function(res) {
            for (var i = 0; i < Tasks.tasks.length; i++) {
                if (Tasks.tasks[i]._id == id) {
                    Tasks.tasks.splice(i, 1);
                }
            }
            return res.data;
        });
    };

    Tasks.create = function(task) {
        return $http.post('/api/tasks', task, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
           Tasks.tasks.unshift(data); 
        });
    };

    Tasks.update = function(task) {
        return $http.put('/api/tasks/' + task._id, task, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
            for (var i = 0; i < Tasks.tasks.length; i++) {
                if (Tasks.tasks[i]._id == data._id) {
                    Tasks.tasks[i] = data;
                }
            }
        });
    };

    Tasks.addComment = function(id, comment) {
        return $http.post('/api/tasks/' + id + '/comments', comment, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        });
    }

    Tasks.addLink = function(id, link) {
        return $http.post('/api/tasks/' + id + '/links', link, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        });
    }

    Tasks.deleteLink = function(id, link) {
        return $http.delete('/api/tasks/' + id + '/links/' + link._id, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        });
    }

    Tasks.newTaskTitle = "New Task";

    Tasks.statusList = [
        {
            class: "open",
            name: "Open"
        },
        {
            class: "progress",
            name: "In Progress"
        },
        {
            class: "complete",
            name: "Completed"
        },
        {
            class: "hold",
            name: "On Hold"
        }
    ];

    Tasks.priorityList = ["Low", "Normal", "High", "Urgent", "Critical"];
    Tasks.typeList = ["Development", "Design", "Testing"];

    Tasks.orderFn = function(task) {
        var time = ((new Date(task.dueDate)).getTime() - Date.now()) / (1000 * 60 * 60);
        var importance = Math.pow(5, Tasks.priorityList.indexOf(task.priority)) * task.loe;
        var order = time > 0 ? time / importance : time * importance;
        //console.log(task.title + " - " + order);
        return order;
    }

    return Tasks; 
}]);

angular.module('kanApp').factory('Projects', ['$http', 'auth', function($http, auth){
    //Tasks Service
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

    Projects.newProjectTitle = "New Project";

    return Projects; 
}]);

angular.module('kanApp').factory('Users', ['$http', 'auth', function($http, auth){
    //Tasks Service
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

    return Users; 
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
                }],
                tasks: ['Tasks', function(Tasks) {
                    return Tasks.getAll();
                }],
                projects: ['Projects', function(Projects) {
                    return Projects.getAll();
                }]
            }
        })
        .when('/projects.html', {
            templateUrl: 'templates/projects.html',
            controller: 'ProjectsController',
            resolve: {
                projects: ['Projects', function(Projects) {
                    return Projects.getAll();
                }]
            }
        })
        .when('/projects/:id', {
            templateUrl: 'templates/project.html',
            controller: 'ProjectController',
            resolve: {
                project: ['$route','Projects', function($route, Projects) {
                    return Projects.get($route.current.params.id);
                }],
            }
        })
        .when('/org.html', {
            templateUrl: 'templates/organisation.html',
            controller: 'OrgController',
            resolve: {
                users: ['Users', function(Users) {
                    return Users.getAll();
                }]
            }
        })
        .when('/reports.html', {
            templateUrl: 'templates/reports.html',
            controller: 'ReportsController'
        })
        .when('/register.html', {
            templateUrl: 'templates/register.html',
            controller: 'AuthController'
        })
        .when('/login.html', {
            templateUrl: 'templates/login.html',
            controller: 'AuthController'
        });

    $locationProvider.html5Mode(true);
});

/**
 * Intercept all route requests and redirect to login if not already logged in
 */
angular.module('kanApp').run([
    '$rootScope', 
    '$location', 
    'auth', 
    function ($rootScope, $location, auth) {
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (!auth.isLoggedIn()) {
                if (next.templateUrl !== 'templates/login.html' && next.templateUrl !== 'templates/register.html') {
                    console.log('Not logged in, redirecting to Login');
                    $location.path('login.html');
                }
            }
        });
    }
]);

angular.module('kanApp').controller('AuthController', [
    '$scope',
    '$location',
    'auth',
    function($scope, $location, auth) {
        $scope.user = {};

        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $location.path('/index.html');
            });
        }

        $scope.logIn = function() {
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $location.path('/index.html');
            });
        }
    }
]);

angular.module('kanApp').controller('NavController', [
    '$scope',
    '$location',
    'auth',
    function($scope, $location, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = function() {
            auth.logOut();
            $location.path('/login.html');
        }

        if ($location.path().indexOf('tasks') > 0) {
            $scope.index = 0;
        }
        else if ($location.path().indexOf('projects') > 0){
            $scope.index = 1;
        }
        else if ($location.path().indexOf('org') > 0){
            $scope.index = 2;
        }
        else if ($location.path().indexOf('reports') > 0){
            $scope.index = 3;
        }
        else {
            $scope.index = 0;
        }
    }
])

angular.module('kanApp').controller('TasksController', [
    '$scope',
    '$timeout',
    '$location',
    'Tasks', 
    'Sounds',
    'auth',
    function TasksController($scope, $timeout, $location, Tasks, Sounds, auth) {
        $scope.views = [
            {value: "mytasks", title: "My Tasks"},
            {value: "completed", title: "Completed Tasks"}
        ];
        $scope.selectedView = $scope.views[0].value;
        
        $scope.updateView = function() {
            console.log($scope.selectedView);
        }

        $scope.taskFilter = function() {
            return function(task) {
                if ($scope.selectedView == 'mytasks') {
                    return !task.completed;
                }
                else if ($scope.selectedView == 'completed') {
                    return task.completed;
                }
            }
        }

        //Orders all of the tasks by priority
        $scope.taskOrder = Tasks.orderFn;
        
        $scope.tasks = Tasks.tasks;
        $scope.task = {};
        
        //Popup that will be displayed so that users can undo completing a task
        $scope.popup = {
            show: false,
            text: '',
            action: ''
        }
        var hidePromise;
        $scope.toggleCompleted = function(task) {
            if (task.completed) {
                task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
            }
            else {
                task.status = Tasks.statusList[1].name;
            }
            Tasks.update(task);
            $scope.task = task;
            Sounds.play('ding');
            //Set contents of undo popup
            $scope.popup.text = task.title + " is " + (task.completed ? "Complete": "Not Complete");
            $scope.popup.show = true;
            hidePromise = $timeout(function(){
                $scope.popup.show = false; 
            }, 10000);
        }

        $scope.undo = function() {
            $scope.task.completed = !$scope.task.completed;
            $scope.popup.show = false;
            Tasks.update($scope.task);
            $timeout.cancel(hidePromise);
        }

        $scope.cancelToastHide = function() {
            $timeout.cancel(hidePromise);
        }

        $scope.editTask = function(task) {
            console.log("Edit: " + task.title);
        }

        $scope.addTask = function() {
            var task = {
                title: Tasks.newTaskTitle,
            }

            if ($scope.selectedView == 'mytasks') {
                task.assignee = auth.currentUser();
            }
            else if ($scope.selectedView == 'completed') {
                task.completed = true;
                task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
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
    'Sounds',
    'Tasks',
    'task',
    'tasks',
    'projects',
    function($scope, $routeParams, Sounds, Tasks, task, tasks, projects) {
        $scope.task = task;
        $scope.tasks = tasks.data;
        $scope.projects = projects.data;
        
        $scope.types = Tasks.typeList;
        $scope.priorities = Tasks.priorityList;
        $scope.statuses = Tasks.statusList;
        
        $scope.link = {};
        
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
            console.log("Saving task...");
            if ($scope.task.status == Tasks.statusList[Tasks.statusList.length - 2].name) {
                $scope.task.completed = true;
            }
            else {
                $scope.task.completed = false;
            }

            Tasks.update($scope.task);
            $scope.viewMode = "view";
        }

        $scope.cancel = function() {
            $scope.viewMode = "view";
            $scope.task = angular.copy($scope.backup);
        }

        $scope.delete = function() {
            //Implement undo functionality similar to tasks controller
            var prompt = confirm("This action cannot be undone, are you sure?");
            if (prompt) {
                Tasks.delete($scope.task._id);
                history.back();
            }
        }

        $scope.addLink = function() {
            $scope.addingLink = !$scope.addingLink;
        }

        $scope.toggleCompleted = function() {
            if ($scope.task.completed) {
                $scope.task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
            }
            else {
                $scope.task.status = Tasks.statusList[1].name;
            }
            Sounds.play('ding');
        }

        $scope.checkLink = function(event) {
            if(event.keyCode == 13) {
                //Simple validation, will add more later
                console.log($scope.link.title);
                console.log($scope.link.url);
                if ($scope.link.title && $scope.link.url) {
                    var link = {
                        title: $scope.link.title,
                        link: $scope.link.url
                    }

                    Tasks.addLink(task._id, link).success(function(link) {
                        $scope.task.links.push(link);
                        $scope.link = {};
                    });
                    $scope.addingLink = false;
                }
            }
        }

        $scope.deleteLink = function(link) {
            Tasks.deleteLink(task._id, link).success(function() {
                for (var i = 0; i < $scope.task.links.length; i++) {
                    if ($scope.task.links[i]._id == link._id) {
                        $scope.task.links.splice(i, 1);
                    }
                }
            });
        }
    }
])

angular.module('kanApp').controller('ProjectsController', [
    '$scope',
    '$location',
    'Projects',
    'projects',
    function ProjectsController($scope, $location, Projects, projects) {
        //console.log(JSON.stringify(projects));
        $scope.projects = Projects.projects;

        $scope.addProject = function() {
            var project = {
                name: Projects.newProjectTitle,
            }
            Projects.create(project).success(function(project) {
                $location.path('/projects/' + project._id);
            });
            console.log("New Project Created")
        }
    }
]);

angular.module('kanApp').controller('ProjectController', [
    '$scope',
    '$location',
    'Tasks',
    'Projects',
    'project',
    'Sounds',
    function ProjectController($scope, $location, Tasks, Projects, project, Sounds) {
        $scope.project = project;
        $scope.stages = Tasks.statusList;
        $scope.taskOrder = Tasks.orderFn;

        if ($scope.project.name === Projects.newProjectTitle) {
            $scope.viewMode = "edit";
            $scope.backup = angular.copy($scope.project);
        }
        else {
            $scope.viewMode = "view";
        }

        $scope.edit = function() {
            $scope.viewMode = "edit";
            $scope.backup = angular.copy($scope.project);
        }

        $scope.editTask = function(task) {
            console.log("Edit: " + task.title);
        }

        $scope.addTask = function(status) {
            console.log("Add Task in " + status);
            var task = {
                title: Tasks.newTaskTitle,
                status: status,
                project: project._id
            }
            Tasks.create(task).success(function(task) {
                $location.path('/tasks/' + task._id);
            });
            console.log("New Task Created")
        }

        $scope.cancel = function() {
            $scope.viewMode = "view";
            $scope.project = angular.copy($scope.backup);
        }

        $scope.delete = function() {
            //Implement undo functionality similar to tasks controller
            var prompt = confirm("This action cannot be undone, are you sure?");
            if (prompt) {
                Projects.delete($scope.project._id);
                history.back();
            }
        }

        $scope.saveEdit = function() {
            //Need to save
            console.log("Saving project...");
            Projects.update($scope.project);
            $scope.viewMode = "view";
        }

        $scope.toggleCompleted = function(task) {
            if (task.completed) {
                task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
            }
            else {
                task.status = Tasks.statusList[1].name;
            }
            Tasks.update(task);
            Sounds.play('ding');
        }

        $scope.onDrop = function(stage, $data){
            $data.status = stage.name;
            if ($data.status == 'Completed') {
                $data.completed = true;
                Sounds.play('ding');
            }
            else {
                $data.completed = false;
            }

            for (var i = 0; i < $scope.project.tasks.length; i++) {
                if ($scope.project.tasks[i]._id == $data._id) {
                    $scope.project.tasks[i] = $data;
                }
            }
            Tasks.update($data);
        };
    }
]);

angular.module('kanApp').controller('OrgController', [
    '$scope',
    'users',
    function OrgController($scope, users) {
        $scope.users = users.data;
        $scope.selectedUser = {};

        $scope.selectUser = function(user) {
            $scope.selectedUser = user;
        }
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