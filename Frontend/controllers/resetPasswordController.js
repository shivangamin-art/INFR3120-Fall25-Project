// Frontend/controllers/resetPasswordController.js

app.controller('ResetPasswordController', function($scope, $http, $routeParams, $location) {
  var baseUrl = 'http://localhost:3000';

  $scope.formData = {};
  $scope.error = '';
  $scope.success = '';

  $scope.submit = function() {
    $scope.error = '';
    $scope.success = '';

    if ($scope.formData.password !== $scope.formData.confirmPassword) {
      $scope.error = 'Passwords do not match.';
      return;
    }

    $http.post(baseUrl + '/api/auth/reset-password', {
      token: $routeParams.token,
      password: $scope.formData.password
    })
      .then(function() {
        $scope.success = 'Password reset successful. You can now log in.';
        $location.path('/login');
      })
      .catch(function(err) {
        $scope.error = (err.data && err.data.message) || 'Failed to reset password.';
      });
  };
});
