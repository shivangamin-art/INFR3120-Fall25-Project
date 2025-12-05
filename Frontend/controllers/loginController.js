// Frontend/controllers/loginController.js

app.controller('LoginController', function(
  $scope,
  $location,
  AuthService,
  $window,
  $timeout
) {
  $scope.formData = {};
  $scope.error = '';

  // ---------- Email/Password Login ----------
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

  // ---------- GitHub callback handling ----------
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

  // ---------- Google Sign-In ----------
  function initGoogle() {
    if (
      !$window.google ||
      !$window.google.accounts ||
      !$window.google.accounts.id
    ) {
      // Script might not be loaded yet – retry shortly
      $timeout(initGoogle, 500);
      return;
    }

    $window.google.accounts.id.initialize({
      client_id: '904508671254-o5987fh7fffgih3b0mko3t8emump15n9.apps.googleusercontent.com',
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

  // Initialize flows
  handleGithubCallback();
  initGoogle();
});
