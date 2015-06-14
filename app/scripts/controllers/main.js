'use strict';

/**
 * @ngdoc function
 * @name PocPos.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pocPosApp
 */
angular.module('pocPosApp')
.constant('POS_EVENTS', {billCreated: 'bill-created'})
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/home.html',
      controller : 'PosCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    });

    $urlRouterProvider.otherwise('/');
}])
.factory('BillidService', ['Receipts',function(Receipts){
  var service = {};

  function createReceipt(mobileNumber, order, total) {

    var _location = 'MAIN LOCATION',
    _type = 'purchase',
    _storeId = '123123ffsdfsdfsdfd',
    _countryCode = '+91',
    _items = _.map(order, function(o){
      return _.pick(o, ['name', 'qty', 'price'])
    });

    var receipt = {
      "location": _location,
      "amount" : total,
      "type": _type,
      "countryCode": _countryCode,
      "storeId": _storeId,
      "mobileNumber": mobileNumber,
      "items" : _items
    };

    return receipt;
  };

  service.notify = function(mobileNumber, order, total) {
    // TODO make the receipt and call the API
    var receipt = createReceipt(mobileNumber, order, total)
    Receipts.create(receipt);
    console.log('saving receipt for customer mobile ' + JSON.stringify(receipt));
  }

  return service;
}])
.controller('LoginCtrl', ['$scope', '$state', 'Auth', function($scope, $state, Auth) {
    $scope.login = function(credentials) {
      $scope.error = false;
      $scope.errorMessage = '';
      if(credentials && credentials.username && credentials.password) {
        Auth.login(credentials).then(function(payload) {
          $state.go('home')
        }, function(reason) {
          if(reason.status === 401) {
            $scope.error = true;
            $scope.errorMessage = 'Invalid username or password';
          }
        });
      } else {
        $scope.error = true;
        $scope.errorMessage = 'Enter username and password';
      }
    }
  }])
.controller('PosCtrl', ['$rootScope', '$scope', '$state', 'POS_EVENTS', 'BillidService', 'Auth',
  function ($rootScope, $scope, $state, POS_EVENTS, BillidService, Auth) {

    $scope.isAuthenticated = function() {
      return Auth.isAuthenticated();
    };

    $scope.logout = function() {
        Auth.logout();
        $state.go('login');
    };

    $scope.drinks = [{
        id: 0,
        name: "Still Water",
        price: 1.00,
    },
    {
        id: 1,
        name: "Sparkling Water",
        price: 1.10,
    },
    {
        id: 2,
        name: "Espresso",
        price: 1.20,
    },
    {
        id: 3,
        name: "Cappuccino",
        price: 1.30,
    },
    {
        id: 4,
        name: "Tea",
        price: 1.90,
    },
    {
        id: 5,
        name: "Hot Chocolate",
        price: 2.10,
    },
    {
        id: 6,
        name: "Coke",
        price: 2.00,
    },
    {
        id: 7,
        name: "Orange Juice",
        price: 1.90,
    }];

    $scope.foods = [{
        id: 8,
        name: "Waffle",
        price: 1.50,
    },
    {
        id: 9,
        name: "Brioche",
        price: 1.30,
    },
    {
        id: 10,
        name: "Cheesecake",
        price: 1.70,
    },
    {
        id: 11,
        name: "Sandwich",
        price: 2.70,
    },
    {
        id: 12,
        name: "Donuts",
        price: 1.90,
    },
    {
        id: 13,
        name: "Tortilla",
        price: 1.90,
    }];

    $scope.order = [];
    $scope.new = {};
    $scope.totOrders = 0;

    var url = window.location.protocol + "://" + window.location.host + "/" + window.location.pathname;

    $scope.getDate = function () {
        var today = new Date();
        var mm = today.getMonth() + 1;
        var dd = today.getDate();
        var yyyy = today.getFullYear();

        var date = dd + "/" + mm + "/" + yyyy

        return date
    };

    $scope.addToOrder = function (item, qty) {
        var flag = 0;
        if ($scope.order.length > 0) {
            for (var i = 0; i < $scope.order.length; i++) {
                if (item.id === $scope.order[i].id) {
                    item.qty += qty;
                    flag = 1;
                    break;
                }
            }
            if (flag === 0) {
                item.qty = 1;
            }
            if (item.qty < 2) {
                $scope.order.push(item);
            }
        } else {
            item.qty = qty;
            $scope.order.push(item);
        }
    };

    $scope.removeOneEntity = function (item) {
        for (var i = 0; i < $scope.order.length; i++) {
            if (item.id === $scope.order[i].id) {
                item.qty -= 1;
                if (item.qty === 0) {
                    $scope.order.splice(i, 1);
                }
            }
        }
    };

    $scope.removeItem = function (item) {
        for (var i = 0; i < $scope.order.length; i++) {
            if (item.id === $scope.order[i].id) {
                $scope.order.splice(i, 1);
            }
        }
    };

    $scope.getTotal = function () {
        var tot = 0;
        for (var i = 0; i < $scope.order.length; i++) {
            tot += ($scope.order[i].price * $scope.order[i].qty)
        }
        return tot * 1.00;
    };

    $scope.clearOrder = function () {
        $scope.order = [];
    };

    $scope.checkout = function (index) {

        var mobileNumber = prompt("Please enter customer mobile number", "88888888");

        if (mobileNumber != null) {
          BillidService.notify(mobileNumber, $scope.order, $scope.getTotal());
        }

        $rootScope.$broadcast(POS_EVENTS.billCreated);
        $scope.order = [];
        $scope.totOrders += 1;
    };

    $scope.addNewItem = function (item) {
        if (item.category === "Drinks") {
            item.id = $scope.drinks.length + $scope.foods.length
            $scope.drinks.push(item)
            $scope.new = []
            $('#myTab a[href="#drink"]').tab('show')
        } else if (item.category === "Foods") {
            item.id = $scope.drinks.length + $scope.foods.length
            $scope.foods.push(item)
            $scope.new = []
            $('#myTab a[href="#food"]').tab('show')
        }
    };
}]);
