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
                    return !task.completed && task.assignee == auth.currentUser();
                }
                else if ($scope.selectedView == 'completed') {
                    return task.completed && task.assignee == auth.currentUser();
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
                task.timeTaken = Date.now() - (new Date(task.timeStarted)).getTime();
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
            //Also put the status back to complete/incomplete
            if ($scope.task.completed) {
                $scope.task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
            }
            else {
                task.status = Tasks.statusList[1].name;
            }
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

        //Just add the new task and naviagte to it
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