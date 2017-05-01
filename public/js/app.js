var app = angular.module('School-App', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {

      controller: 'loginCtr',
      templateUrl: 'views/login.html',
      controllerAs: 'vm'
    })
    .when('/dashboard', {
      resolve: {
        "check": function($location, $rootScope) {
          if (!$rootScope.loggedIn) {
            $location.path('/');
          }
        }

      },

      templateUrl: 'views/dashboard.html',
      controller: 'loginCtr',
      controllerAs: 'vm'

    })
    .when('/register', {
      controller: 'loginCtr',
      templateUrl: 'views/register.html',
      controllerAs: 'vm'

    })
    .otherwise({
      redirectTo: '/'
    });

});

// Set Control
app.controller('loginCtr', ['$http', '$scope', '$location', '$rootScope', '$cookies', '$window', 'userPersistenceService', function($http, $scope, $location, $rootScope, $cookies, $window, userPersistenceService) {
  var vm = this;
  this.currentUser;


  // Control for login
  this.submit = function() {
    console.log(this);
    $rootScope.loggedIn = false;
    $http({
      method: 'POST',
      url: "/login",
      data: {
        username: this.username,
        password: this.password
      }
    }).then(function(response) {

      if (response.data.success === true) {

        $scope.error_msg = null;
        $rootScope.loggedIn = true;
        $rootScope.currentUser = response.data.user;

        localStorage.setItem('token', JSON.stringify(response.data.token));
        // userPersistenceService.setCookieData(response.data.token);
        // $cookies.put("userName", response.data.token);
        // $window.sessionStorage.setItem('token', JSON.stringify(response.data.token));

        $location.path('/dashboard');
      } else {
        $scope.error_msg = response.data.message;
        $rootScope.loggedIn = false;
      }
    }, function(error) {
      $rootScope.loggedIn = false;
      console.log("login failure", response);
    });
  }


  // create user ... from register form
  this.register = function() {
    console.log("Register.. submit");

    $http({
      method: 'POST',
      url: "/login/register",
      data: this
    }).then(function(response) {
      console.log("Register success", response);
      if (response.data.success === true) {
        $scope.error_msg = null;
        // $rootScope.loggedIn = true;
        $location.path('/login');
      } else {
        $scope.error_msg = response.data;
      }


    }, function(error) {
      console.log("Register failure", response);
    });
  };

  // Get all user .. testing..
  $scope.getUsers = function() {
    $http({
      url: '/users',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response);
      if (response.data.status == 401) {
        this.error = "Unauthorized";
      } else {
        this.users = response.data;
        $scope.allUsers = response.data;
        // $location.path('/dashboard');
      }
    }.bind(this));
  };

  this.logout = function() {
    console.log("logout");
    $rootScope.loggedIn = false;
    localStorage.clear('token');
    // userPersistenceService.clearCookieData('userName');
    location.reload();
  };


}]);

// Set Control
app.controller('UserController', ['$http', '$scope', '$location', '$rootScope', '$cookies', '$window', function($http, $scope, $location, $rootScope, $cookies, $window) {



}]);

app.factory("userPersistenceService", [
  "$cookies",
  function($cookies) {
    var userName = "";

    return {
      setCookieData: function(username) {
        userName = username;
        $cookies.put("userName", username);
      },
      getCookieData: function() {
        userName = $cookies.get("userName");
        return userName;
      },
      clearCookieData: function() {
        userName = "";
        $cookies.remove("userName");
      }
    }
  }
]);
