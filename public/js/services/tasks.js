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
                    //Remove task from local array as well
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
            //Use unshift instead of push so new task gets added to top of list
            Tasks.tasks.unshift(data); 
        });
    };

    Tasks.update = function(task) {
        return $http.put('/api/tasks/' + task._id, task, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
            for (var i = 0; i < Tasks.tasks.length; i++) {
                if (Tasks.tasks[i]._id == data._id) {
                    //Update local array of tasks
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
    Tasks.difficultyList = ["Easy", "Moderate", "Hard", "Unknown"];

    //Used to automatically prioritise tasks so that overdue and important tasks receive a lower number and appear towards the top of the list.
    Tasks.orderFn = function(task) {
        var time = ((new Date(task.dueDate)).getTime() - Date.now()) / (1000 * 60 * 60);
        var importance = Math.pow(5, Tasks.priorityList.indexOf(task.priority)) * task.loe;

        //Make smaller if less than 0 and greater if larger
        var order = time > 0 ? time / importance : time * importance;

        return order;
    }

    return Tasks; 
}]);