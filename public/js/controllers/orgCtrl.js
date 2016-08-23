angular.module('kanApp').controller('OrgController', [
    '$scope',
    'Users',
    'Reports',
    'Upload',
    'auth',
    function OrgController($scope, Users, Reports, Upload, auth) {
        $scope.users = Users.users;
        $scope.selectedUser = undefined;
        $scope.selectedIndex;
        $scope.viewMode = "view";
        $scope.stats = Reports.userStats;
        
        $scope.selectUser = function(user, index) {
            $scope.selectedUser = user;
            $scope.selectedIndex = index;
            Reports.getUserStats(user.username);
            $scope.uploadComplete = false;
        }

        $scope.edit = function() {
            $scope.viewMode = "edit";
            $scope.backup = angular.copy($scope.selectedUser);
        }

        $scope.saveEdit = function() {
            //Need to save
            console.log("Saving user...");
            Users.update($scope.selectedUser);
            $scope.viewMode = "view";
        }

        $scope.cancel = function() {
            $scope.viewMode = "view";
            $scope.selectedUser = angular.copy($scope.backup);
        }

        $scope.delete = function() {
            var prompt = confirm("This action cannot be undone, are you sure?");
            if (prompt) {
                Users.delete($scope.selectedUser._id);
                $scope.selectedUser = undefined;
                $scope.selectedIndex = undefined;
                $scope.viewMode = "view";
            }
        }

        // upload on file select or drop
        $scope.upload = function (file) {
            Upload.upload({
                url: '/api/users/upload',
                data: {file: file, 'username': $scope.selectedUser.username},
                headers: {'Authorization': 'Bearer '+ auth.getToken()}, // only for html5
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + JSON.stringify(resp.data));
                $scope.uploadComplete = true;
                $scope.selectedUser.profileImage = '/uploads/' + resp.data.filename;
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };
    }
]);