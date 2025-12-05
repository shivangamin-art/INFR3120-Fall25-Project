// Frontend/controllers/loginController.js

app.controller('LoginController', function($scope, $location, AuthService, $window, $timeout) {
  $scope.formData = {};
  $scope.error = '';

  // Normal email/password login
  $scope.login = function() {
    $scope.error = '';

    AuthService.login($scope.formData)
      .then(function() {
        $location.path('/cars');
      })
      .catch(function(err) {
        console.error(err);
        $scope.error =
          (err.data && err.data.message) ||
          'Login failed. Please check your email and password.';
      });
  };

  // Handle GitHub callback token in URL
  function handleGithubCallback() {
    var search = $location.search();
    var githubToken = search.githubToken;
    var email = search.email;

    if (githubToken && email) {
      AuthService.acceptExternalLogin(githubToken, email)
        .then(function() {
          // Clean query params from URL
          $location.search('githubToken', null);
          $location.search('email', null);
          $location.path('/cars');
        });
    }
  }

  // Initialize Google Sign-In button
  function initGoogle() {
    if (!$window.google || !$window.google.accounts || !$window.google.accounts.id) {
      // Script might not be loaded yet – try again shortly
      $timeout(initGoogle, 500);
      return;
    }

    $window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID', // TODO: put your real client id here
      callback: handleGoogleCredential
    });

    $window.google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'outline', size: 'large' }
    );
  }

  function handleGoogleCredential(response) {
    var credential = response.credential;

    AuthService.googleLogin(credential)
      .then(function() {
        $location.path('/cars');
      })
      .catch(function(err) {
        console.error(err);
        $scope.$apply(function() {
          $scope.error = 'Google login failed.';
        });
      });
  }

  handleGithubCallback();
  initGoogle();
});
