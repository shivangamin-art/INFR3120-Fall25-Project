// Frontend/controllers/forgotPasswordController.js

app.controller('ForgotPasswordController', function($scope, $http) {
  var baseUrl = 'http://localhost:3000';

  $scope.formData = {};
  $scope.error = '';
  $scope.success = '';

  $scope.submit = function() {
    $scope.error = '';
    $scope.success = '';

    $http.post(baseUrl + '/api/auth/forgot-password', $scope.formData)
      .then(function() {
        $scope.success = 'If an account with that email exists, a reset link has been sent.';
      })
      .catch(function(err) {
        $scope.error = (err.data && err.data.message) || 'Failed to request password reset.';
      });
  };
});
