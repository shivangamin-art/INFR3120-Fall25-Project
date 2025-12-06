// Frontend/controllers/loginController.js

app.controller('LoginController', function($scope, $location, AuthService) {
  $scope.formData = {};
  $scope.error = '';

  $scope.login = function() {
    $scope.error = '';

    AuthService.login($scope.formData)
      .then(function(user) {
        if (!user) {
          $scope.error = 'Login failed. Please check your email and password.';
          return;
        }
        // authChanged event already fired; just navigate
        $location.path('/cars');
      })
      .catch(function(err) {
        $scope.error = (err.data && err.data.message) || 'Login failed. Please check your email and password.';
      });
  };
});
