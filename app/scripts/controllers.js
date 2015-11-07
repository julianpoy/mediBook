angular.module('starter.controllers', [])

//Need this to display files and things
.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //})

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {

    //Create the modal
    $scope.modal = modal;

    //Look for the session Token
    var sessionToken;
    if(window.localStorage.getItem("sessionToken"))  sessionToken = window.localStorage.getItem("sessionToken");
    else {
        //Open the login modal
        //$scope.modal.show();
    }
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
          $scope.closeLogin();
        }, 1000);
  };



// END APP CONTROLLER
})

.controller('AuthCtrl', function($scope, $timeout) {

    //Show The Next Page
    $scope.showNextPage = function() {

       //Timeout to apply the variable change
       $timeout(function () {
           //Set show page one false
           $scope.showPageOne = false;
       }, 0);

        //Timeout to show next thing
        $timeout(function () {
            //Show the next page
            $scope.showPageTwo = true;
        }, 1000);
    }

    //Show the register confirmation
    $scope.showRegConfirm = function () {

        //Show the confrmation
        $timeout(function () {
            $scope.confirmed = true;
        }, 0);
    }

    //Register the User
    $scope.registerUser = function () {
        //Set Loading to true
        $scope.loading = true;
    }

    //Login the User
    $scope.loginUser = function () {
        //Set Loading to true
        $scope.loading = true;
    }
})

.controller('NewCtrl', function($scope, $cordovaCamera, $cordovaImagePicker) {

    //Get a photo from the gallery
    //http://learn.ionicframework.com/formulas/cordova-camera/
    $scope.getPhoto = function() {

    var options = {
        quality: 75,

    };

    $cordovaImagePicker.getPictures().then(function(imageData) {
        console.log("img URI= " + imageData);
        //Here you will be getting image data
    }, function(err) {
        alert("Failed because: " + err);
        console.log('Failed because: ' + err);
    });

    };

    //http://ngcordova.com/docs/plugins/imagePicker/
    $scope.takePhoto = function () {

        //Options for the Photo
        var options = {
            quality: 75,
            saveToPhotoAlbum: false
        };

        //Open the camera to take the picture
        $cordovaCamera.getPicture(options).then(function(imageData) {

            //save the image URI
            $scope.cameraPhoto = imageData;

        }, function(err) {
            alert("Failed because: " + err);
            console.log('Failed because: ' + err);
        });
    }

    //Submit the document to the backend

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('DocumentCtrl', function($scope, $stateParams) {

});
