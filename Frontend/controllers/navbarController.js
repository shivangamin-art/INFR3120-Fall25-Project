// Frontend/controllers/navbarController.js

app.controller('NavbarController', function($scope, AuthService, $rootScope) {
  $scope.isAuthenticated = false;
  $scope.currentUser = {};

  function applyUser(user) {
    if (user) {
      $scope.isAuthenticated = true;
      $scope.currentUser = user;
    } else {
      $scope.isAuthenticated = false;
      $scope.currentUser = {};
    }
  }

  // Initial load
  AuthService.me().then(applyUser);

  // Listen for changes from AuthService
  $rootScope.$on('authChanged', function(_event, user) {
    applyUser(user);
  });

  $scope.logout = function() {
    AuthService.logout().then(function() {
      // After logout, redirect to home
      window.location.hash = '#!/';
    });
  };
});
