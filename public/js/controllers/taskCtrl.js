angular.module('kanApp').controller('TaskController', [
    '$scope',
    '$routeParams',
    'Sounds',
    'Tasks',
    'task',
    'tasks',
    'projects',
    'users',
    function($scope, $routeParams, Sounds, Tasks, task, tasks, projects, users) {
        $scope.task = task;
        $scope.tasks = tasks.data;
        $scope.projects = projects.data;
        $scope.users = users.data;
        
        $scope.types = Tasks.typeList;
        $scope.priorities = Tasks.priorityList;
        $scope.statuses = Tasks.statusList;
        $scope.difficulties = Tasks.difficultyList;
        
        $scope.link = {};
        
        //If task is new, default to edit mode so user can add required info
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
            console.log("Saving task...");
            //Checking if status is complete
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
            //Could also implement undo function but this is ok
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
            //Update status to complete
            if ($scope.task.completed) {
                $scope.task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
                $scope.task.timeTaken = Date.now() - (new Date($scope.task.timeStarted)).getTime();
            }
            else {
                $scope.task.status = Tasks.statusList[1].name;
            }
            Sounds.play('ding');
        }

        $scope.startTask = function() {
            if ($scope.task.timeStarted) {
                $scope.task.timeStarted = null;
            }
            else {
                $scope.task.timeStarted = new Date();
            }
        }

        $scope.checkLink = function(event) {
            if(event.keyCode == 13) {
                //Simple validation, ensure that both have been entered
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
]);