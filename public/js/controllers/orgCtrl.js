angular.module('kanApp').controller('OrgController', [
    '$scope',
    'Users',
    'Reports',
    function OrgController($scope, Users, Reports) {
        $scope.users = Users.users;
        $scope.selectedUser = undefined;
        $scope.selectedIndex;
        $scope.viewMode = "view";
        $scope.stats = Reports.userStats;
        
        $scope.selectUser = function(user, index) {
            $scope.selectedUser = user;
            $scope.selectedIndex = index;
            Reports.getUserStats(user.username);
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
    }
]);