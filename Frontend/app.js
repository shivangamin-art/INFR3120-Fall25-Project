// Frontend/app.js

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
    .otherwise({ redirectTo: '/' });
});
