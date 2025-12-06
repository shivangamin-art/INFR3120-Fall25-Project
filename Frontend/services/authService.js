// Frontend/services/authService.js

app.factory('AuthService', function($http, $rootScope) {
  // Local dev backend URL - change to Render URL in production
  var baseUrl = 'http://localhost:3000';

  var currentUser = null;

  function setCurrentUser(user) {
    currentUser = user;
    // Let the whole app know auth changed
    $rootScope.$broadcast('authChanged', currentUser);
  }

  // Fetch logged-in user from backend
  function fetchMe() {
    return $http.get(baseUrl + '/api/auth/me', { withCredentials: true })
      .then(function(res) {
        var data = res.data;

        // Try common shapes:
        // 1) { user: {...} }
        // 2) { _id, email, name, ... }
        // 3) { authenticated: false } or {} => not logged in
        var user = null;

        if (data && data.user) {
          user = data.user;
        } else if (data && (data._id || data.email || data.name)) {
          user = data;
        }

        if (data && data.authenticated === false) {
          user = null;
        }

        setCurrentUser(user);
        return currentUser;
      })
      .catch(function() {
        setCurrentUser(null);
        return null;
      });
  }

  return {
    register: function(payload) {
      return $http.post(baseUrl + '/api/auth/register', payload, { withCredentials: true });
    },

    login: function(credentials) {
      return $http.post(baseUrl + '/api/auth/login', credentials, { withCredentials: true })
        .then(function() {
          // After login, refresh user state
          return fetchMe();
        });
    },

    logout: function() {
      return $http.post(baseUrl + '/api/auth/logout', {}, { withCredentials: true })
        .then(function() {
          setCurrentUser(null);
        });
    },

    me: fetchMe,

    getCurrentUser: function() {
      return currentUser;
    }
  };
});
