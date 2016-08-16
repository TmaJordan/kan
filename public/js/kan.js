'use strict';
/**
 * @author Thomas Jordan
 * Kan, a task and project management application submitted for my Masters in Applied Digital Media 2016.
 * Using:
 *  Angular route
 *  Angular Animation
 *  MomentJS for Angular
 *  Datepicker from 720kb
 *  Angular Drag and Drop
 */
angular.module('kanApp', ['ngRoute', 'ngAnimate', 'angularMoment', '720kb.datepicker', 'ang-drag-drop']);

/**
 * Handles all of the routing and templating client-side using ng-route
 */
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
                }],
                users: ['Users', function(Users) {
                    return Users.getAll();
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