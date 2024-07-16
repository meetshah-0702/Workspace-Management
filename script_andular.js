const app = angular.module('authApp', ['ngRoute']);
// var email = '';

app.factory('AuthService', function($http,$window) {
    var storage = $window.localStorage;
  return {
    login: function(user) {
      return $http.post('/api/auth/login', user);
    },
    register: function(user) {
      return $http.post('/api/auth/register', user);
    },
    setToken: function(token) {
      localStorage.setItem('token', token);
    },
    setEmail: function(userEmail) {
        email = userEmail;
        storage.setItem('email', userEmail);  
    },
    getEmail: function() {
        email = storage.getItem('email');
        return email;
  
    }
  };
});

app.controller('AuthController', function($scope, $http, $location, $window, AuthService) {
  $scope.user = {};

  $scope.login = function() {
    AuthService.login($scope.user)
      .then(function(response) {
        AuthService.setToken(response.data.token);
        AuthService.setEmail($scope.user.email);
        console.log(AuthService.getEmail());
        if ($scope.user.email === 'hiten@gmail.com' && response.data.token) {
          openAdminPageInNewTab(response.data.token);
        } else {
          openUserPageInNewTab(response.data.token);
        }
        $location.path('/');
      })
      .catch(function(error) {
        console.error('Error during login:', error);
      });
  };

  $scope.register = function() {
    AuthService.register($scope.user).then(function(response) {
      $location.path('/login');
    }).catch(function(error) {
      console.error('Error during registration:', error);
    });
  };

  function openAdminPageInNewTab(token) {
    var win = $window.open('/html/index_admin.html?token=' + token, '_blank');
    if (win) {
      win.focus();
    } else {
      console.error('Failed to open admin page in new tab.');
    }
  }

  function openUserPageInNewTab(token) {
    var win = $window.open('/html/index_user.html?token=' + token, '_blank');
    if (win) {
      win.focus();
    } else {
      console.error('Failed to open user page in new tab.');
    }
  }
});

app.controller('AdminController', function($scope,$http , AuthService) {
    var email = AuthService.getEmail();
   
    var phone = null ;
  $scope.email = AuthService.getEmail();
  $scope.name = $scope.email.split('@')[0];
  var name = $scope.email.split('@')[0];
  console.log(AuthService.getEmail());
$scope.number = null ;
  var userData = {
    name: $scope.name,
    email: $scope.email,
    number: $scope.number
  };
  $scope.changed = function(){
    var userData = {
        name: $scope.name,
        email: $scope.email,
        number: $scope.number
      };
  $http.post('/api/data-change', userData)
  .then(function(response) {
    console.log('User data updated successfully:', response.data);
    // Optionally update UI or perform other actions upon successful update
  })
  .catch(function(error) {
    console.error('Error updating user data:', error);
  });
  
}
 $scope.changed();

 function fetchUserProfile() {
    var user = {
        name: $scope.name,
        email: $scope.email,
        number: $scope.number
    };
    $http.get('/api/user-profile' , user)
        .then(function(response) {
            // Assuming response.data contains user profile data
            $scope.name = response.data.name;
            $scope.email = response.data.email;
            $scope.number = response.data.contactNumber;
        })
        .catch(function(error) {
            console.error('Error fetching user profile:', error);
        });
}
fetchUserProfile();
});
