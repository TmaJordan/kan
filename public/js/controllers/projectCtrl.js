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
        $scope.checkOverdue = Tasks.checkOverdue;

        //If new Project, default to edit view, else view mode
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

        $scope.export = function() {
            Projects.export($scope.project);
        }

        $scope.editTask = function(task) {
            console.log("Edit: " + task.title);
        }

        //Create new task with appropriate status nad project
        $scope.addTask = function(status) {
            console.log("Add Task in " + status);
            var task = {
                title: Tasks.newTaskTitle,
                status: status,
                project: project._id,
                loe: 0.5,
                priority: Tasks.priorityList[1],
                difficulty: Tasks.difficultyList[1]
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
            //Update the status so it moves to the correct swim lane
            if (task.completed) {
                task.status = Tasks.statusList[Tasks.statusList.length - 2].name;
                task.timeTaken = Date.now() - (new Date(task.timeStarted)).getTime();
            }
            else {
                task.status = Tasks.statusList[1].name;
            }
            Tasks.update(task);
            Sounds.play('ding');
        }

        //Allow dragging and dropping task to new status/swim lane
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