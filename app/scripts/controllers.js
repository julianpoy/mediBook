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

.controller('AuthCtrl', function($scope, $timeout, User) {

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

        var payload = {
            username: $scope.regData.username,
            password: $scope.regData.password
        };

        User.join(payload, function(data, status){
            window.localStorage.setItem("sessionToken", data.token);
            window.localStorage.setItem("key", $scope.regData.key);
            $scope.closeLogin();
        }, function(){
            alert("FAILURE!");
        });

    }

    //Login the User
    $scope.loginUser = function () {
        //Set Loading to true
        $scope.loading = true;

        var payload = {
            username: $scope.loginData.username,
            password: $scope.loginData.password
        };

        User.login(payload, function(data, status){
            window.localStorage.setItem("sessionToken", data.token);
            window.localStorage.setItem("key", $scope.loginData.key);
            $scope.closeLogin();
        }, function(){
            alert("FAILURE!");
        });
    }
})

.controller('NewCtrl', function($scope, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $http, Document, $timeout) {

    //Initialize the new document
    $scope.newDoc = {};

    //Grab the sessionToken
    $scope.sessionToken = sessionToken = window.localStorage.getItem("sessionToken");

    //Initialize the files array
    $scope.uploadImage;

    $scope.docSelect = function(){
        ionic.trigger('click', { target: document.getElementById('fileInput') });
    }

    $scope.getDoc = function(target){
        var file = target.files[0];
        $scope.uploadImage = file.name;
        $scope.$apply();
    };

    //Get a photo from the gallery
    //http://learn.ionicframework.com/formulas/cordova-camera/
    $scope.getPhoto = function() {

    var options = {
        quality: 75,

    };

    $cordovaImagePicker.getPictures().then(function(imageData) {
        $scope.uploadImage = imageData[0];
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
            $scope.uploadImage = imageData;

        }, function(err) {
            alert("Failed because: " + err);
            console.log('Failed because: ' + err);
        });
    }

    //Submit the document to the backend
    $scope.submitDoc = function() {

        //First check if we added any files
        if($scope.uploadImage)
        {
            //Our backend url and the file we would like to upload
            var uploadUrl = "http://mangorabo.ngrok.kondeo.com:8080/documents/file";
            var file = $scope.uploadImage;

            var options = {};

            $cordovaFileTransfer.upload(uploadUrl, file, options, true).then(function(result) {
                var imageName = JSON.parse(result.response);

                var imageArray = [];
                imageArray.push(imageName.filename);

                var payload = {
                    sessionToken: $scope.sessionToken,
                    title: $scope.newDoc.title,
                    body: $scope.newDoc.desc,
                    images: imageArray
                };

                alert("dfd");

                Document.create(payload, function(data, status) {
                    alert("dfd2");
                }, function(err){
                    alert(angular.toJson(err));
                });

              }, function(err) {
                alert(err);
              }, function (progress) {
                $timeout(function () {
                  $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                })
              });
        }
    }
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
