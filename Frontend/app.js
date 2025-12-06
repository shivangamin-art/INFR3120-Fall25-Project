var app = angular.module('autorentApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginController'
    })
    .when('/register', {
      templateUrl: 'views/register.html',
      controller: 'RegisterController'
    })
    .when('/cars', {
      templateUrl: 'views/cars.html',
      controller: 'CarsController'
    })
    .when('/cars/new', {
      templateUrl: 'views/car-form.html',
      controller: 'CarFormController'
    })
    .when('/cars/:id/edit', {
      templateUrl: 'views/car-form.html',
      controller: 'CarFormController'
    })
    .when('/forgot-password', {
      templateUrl: 'views/forgot-password.html',
      controller: 'ForgotPasswordController'
    })
    .when('/reset-password/:token', {
      templateUrl: 'views/reset-password.html',
      controller: 'ResetPasswordController'
    })
    .otherwise({ redirectTo: '/' });
});
