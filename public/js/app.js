var app = angular.module('School-App', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider) {

  $routeProvider
    .when('/', {
      controller: 'loginCtr',
      templateUrl: 'views/login.html',
      reloadOnSearch: false,
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
      //Added a meals config
    }).when('/meals', {
      controller: 'mealController',
      templateUrl: 'views/addMeals.html',
      controllerAs: 'vm'
    }).when('/meals/:id', {
      controller: 'mealController',
      templateUrl: 'views/editMeal.html',
      controllerAs: 'vm'
    }).when('/meals/display', {
      controller: 'mealController',
      templateUrl: 'views/editMeal.html',
      controllerAs: 'vm'
    })
    .when('/childs/add', {
      controller: 'childController',
      templateUrl: 'views/addChild.html',
      controllerAs: 'vm'
    }).when('/childs/:id', {
      controller: 'childController',
      templateUrl: 'views/editChild.html',
      controllerAs: 'vm'
    })
    .when('/childs/getOneChild', {
      controller: 'childController',
      templateUrl: 'views/mealhistory.html',
      controllerAs: 'vm'
    }).when('/users/funds', {
      controller: 'userController',
      templateUrl: 'views/funds.html',
      controllerAs: 'vm'
    })
    .otherwise({

      redirectTo: '/'
    });

});

// Set Control
app.controller('loginCtr', ['$http', '$scope', '$location', '$rootScope', '$cookies', '$window', 'userPersistenceService', function($http, $scope, $location, $rootScope, $cookies, $window, userPersistenceService) {
  // app.controller('loginCtr', ['$http', '$scope', '$location', '$rootScope', function($http, $scope, $location, $rootScope) {
  var vm = this;
  this.currentUser;

  // Control for login
  this.submit = function() {

    $scope.error_msg = null;
    $rootScope.loggedIn = false;
    localStorage.clear('token');
    userPersistenceService.clearCookieData('userName');
    console.log("iam in login ");

    $http({
      method: 'POST',
      url: "/login",
      data: {
        username: this.username,
        password: this.password
      }
    }).then(function(response) {
      console.log(response);
      if (response.data.success === true) {

        $scope.error_msg = null;
        $rootScope.loggedIn = true;
        $rootScope.currentUser = response.data.user;
        $rootScope.children = response.data.children;

        localStorage.setItem('token', JSON.stringify(response.data.token));
        userPersistenceService.setCookieData(response.data.token);
        $window.sessionStorage.setItem('token', JSON.stringify(response.data.token));

        $location.path('/dashboard');
      } else {
        $scope.error_msg = response.data.message;
        $rootScope.loggedIn = false;
      }
    }, function(error) {
      $rootScope.loggedIn = false;
      console.log("login failure");
    });
  };

  // create user ... from register form
  this.register = function() {
    $http({
      method: 'POST',
      url: "/login/register",
      data: this,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
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

  this.logout = function() {
    $scope.error_msg = null;
    localStorage.clear('token');
    userPersistenceService.clearCookieData('userName');
    location.reload();

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
}]);


// Set User Control
app.controller('childController', ['$http', '$scope', '$location', '$rootScope', function($http, $scope, $location, $rootScope) {
  var vm = this;

  this.saveChild = function(parentid) {

    $http({
      method: 'POST',
      url: '/childs/add',
      data: {
        parentid: parentid,
        firstname: this.firstname,
        lastname: this.lastname,
        school: this.school,
        grade: this.grade,
        funds: this.funds
      },
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response.data);
      $rootScope.children = response.data;
      $location.path('/dashboard');
    });
  };

  $scope.getChildren = function(parentid) {
    $http({
      method: 'GET',
      url: '/childs/getAll/',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response);
      vm.childs = response.data;
    });

  };

  this.getOneChild = function(childId) {
    $http({
      method: 'GET',
      url: '/childs/getTheChild/' + childId,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log("what", response);
      vm.childs = response.data;
    });

  };

  this.getChild = function() {
    $http({
      method: 'GET',
      url: '/childs',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response);
      vm.childs = response.data;
    });
  };
  // this.getChild();
  this.editChild = function(id) {
    this.editableChild = id;
  };

  this.updateChild = function(child) {
      console.log("update child");
    $http({
      method: 'PUT',
      url: '/childs/' + child._id,
      data: child,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      vm.editableChild = null;
      vm.getChild();
    });
  };


  this.deleteChild = function(id) {
    $http({
      method: 'DELETE',
      url: '/childs/' + id,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      vm.getChild();
    });
  };



}]);

// Set Meals Control
app.controller('mealController', ['$http', '$scope', '$location', '$rootScope', function($http, $scope, $location, $rootScope) {
  var vm = this;



  //added a meals
  this.addMeal = function() {
    $http({
      method: 'POST',
      url: '/meals',
      data: {
        menu: this.menu,
        cost: this.cost,
        date: this.date
      },
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response.data);
      vm.meals = response.data;
      $location.path('/meals/display');
    });
  };

  this.getMeal = function() {

    $http({
      method: 'GET',
      url: '/meals',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response);
      vm.meals = response.data;
    });
  };
  // this.getMeal();


  this.editMeal = function(id) {
    this.editableMeal = id;
  };


  this.updateMeal = function(meal) {
    $http({
      method: 'PUT',
      url: '/meals/' + meal._id,
      data: meal,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      vm.editableMeal = null;
      vm.getMeal();
    });
  };


  this.deleteMeal = function(id) {
    $http({
      method: 'DELETE',
      url: '/meals/' + id,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      vm.getMeal();
    });
  };


}]);

// Set UserCont Control
app.controller('userController', ['$http', '$scope', '$location', '$rootScope', function($http, $scope, $location, $rootScope) {
  var vm = this;

  // get the parent with chidren (student) .. go to fund page to fund them.
  this.fundStudent = function(parentId) {
    console.log(parentId);
    $http({
      method: 'GET',
      url: '/users/getParent/' + parentId,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      console.log(response.data);
      vm.children = response.data;
      $location.path('/users/funds');

    });

  };



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
    };
  }
]);
