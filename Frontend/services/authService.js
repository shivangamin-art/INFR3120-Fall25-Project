// Frontend/services/authService.js

app.factory('AuthService', function($http, $q) {
  var API_BASE = (function() {
    if (window.location.hostname === 'localhost') {
      return ''; // same origin: http://localhost:3000
    }
    return 'https://backend-gamma-eight-27.vercel.app';
  })();

  var TOKEN_KEY = 'autorent_token';
  var USER_KEY = 'autorent_user';

  var currentUser = loadUserFromStorage();

  function loadUserFromStorage() {
    try {
      var stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    currentUser = user;
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
  }

  return {
    register: function(payload) {
      return $http.post(API_BASE + '/api/auth/register', payload)
        .then(function(res) {
          var data = res.data;
          if (data && data.token && data.user) {
            saveAuth(data.token, data.user);
          }
          return data;
        });
    },

    login: function(credentials) {
      return $http.post(API_BASE + '/api/auth/login', credentials)
        .then(function(res) {
          var data = res.data;
          if (data && data.token && data.user) {
            saveAuth(data.token, data.user);
          }
          return data.user;
        });
    },

    // Google login: send credential to backend
    googleLogin: function(credential) {
      return $http.post(API_BASE + '/api/auth/google', { credential: credential })
        .then(function(res) {
          var data = res.data;
          if (data && data.token && data.user) {
            saveAuth(data.token, data.user);
          }
          return data.user;
        });
    },

    // For GitHub callback redirect – token/email come from URL
    acceptExternalLogin: function(token, email) {
      if (token && email) {
        saveAuth(token, { email: email });
      }
      return $q.resolve(currentUser);
    },

    logout: function() {
      clearAuth();
      return $q.resolve();
    },

    me: function() {
      return $q.resolve(currentUser);
    },

    getCurrentUser: function() {
      return currentUser;
    },

    getToken: function() {
      return localStorage.getItem(TOKEN_KEY);
    }
  };
});
