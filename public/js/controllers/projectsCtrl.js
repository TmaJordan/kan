angular.module('kanApp').controller('ProjectsController', [
    '$scope',
    '$location',
    'Projects',
    'projects',
    function ProjectsController($scope, $location, Projects, projects) {
        $scope.projects = Projects.projects;

        //Simply create a new project and navigate to it.
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