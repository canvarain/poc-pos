'use strict';

/**
 * @ngdoc overview
 * @name pocPosApp
 * @description
 * # pocPosApp
 *
 * Main module of the application.
 */
angular
  .module('pocPosApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'angular-storage',
    'angular-jwt',
    'billidpoc'
  ])
  .constant('ENVIRONMENT', 'STAGING')
  .constant('BASE_URL', 'https://billid-poc-api.herokuapp.com');
