angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Documents) {

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
    scope: $scope,
    backdropClickToClose: false,
    hardwareBackButtonClose: false
  }).then(function(modal) {

    //Create the modal
    $scope.modal = modal;

    //Look for the session Token
    $scope.sessionToken;
    if(window.localStorage.getItem("sessionToken"))  $scope.sessionToken = window.localStorage.getItem("sessionToken");
    else {
        //Open the login modal
        $scope.modal.show();
    }
  });

  //Reinitialize modal
  $scope.reInitModal = function() {

      $scope.modal = null;

      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function(modal) {

        //Create the modal
        $scope.modal = modal;
    });
  }



  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();

    //Check if they have their session token
    if(window.localStorage.getItem("sessionToken")) {
        //Allow them to exit the login
        $timeout(function () {
            $scope.modal.backdropClickToClose = true;
            $scope.modal.hardwareBackButtonClose = true;
        }, 0);
    }
    else {
        //Allow them to exit the login
        $timeout(function () {
            $scope.modal.backdropClickToClose = false;
            $scope.modal.hardwareBackButtonClose = true;
        }, 0);
    }

  };

// END APP CONTROLLER
})

.controller('AuthCtrl', function($scope, $timeout, User) {

    $scope.showPageOne = true;

    //Get the session Token
    $scope.sessionToken = window.localStorage.getItem("sessionToken");

    //Show The Next Page
    $scope.showNextPage = function() {

        console.log($scope.showPageOne);

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

            //Re init the modal
            $timeout(function () {
                $scope.reInitModal();
            }, 10);
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

            //Re init the modal
            $timeout(function () {
                $scope.reInitModal();
            }, 10);
        }, function(){
            alert("FAILURE!");
        });
    }
})

.controller('NewCtrl', function($scope, $cordovaCamera, $cordovaImagePicker) {

    //Get a photo from the gallery
    //http://learn.ionicframework.com/formulas/cordova-camera/
    $scope.getPhoto = function() {

    var options = {
        quality: 75

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
            quality: 75
        };

        $cordovaCamera.getPicture().then(function(imageData) {
            console.log("img URI= " + imageData);
            //Here you will be getting image data
        }, function(err) {
            alert("Failed because: " + err);
            console.log('Failed because: ' + err);
        });
    }
})

.controller('HomeCtrl', function($scope, $cordovaFileTransfer, Documents) {
    if(window.localStorage.getItem("sessionToken"))  $scope.sessionToken = window.localStorage.getItem("sessionToken");
    //Query the backend for the documents
    $scope.getDocuments = function () {

        //Check if we have the documents already
        if($scope.documents == null && $scope.sessionToken)
        {
            //Create the documents object
            $scope.documents = [];

            //Set Loading to true
            $scope.loading = true;

            if(window.localStorage.getItem("sessionToken"))  $scope.sessionToken = window.localStorage.getItem("sessionToken");

            var payload = {
                sessionToken: $scope.sessionToken
            };

            Documents.get(payload, function(data, status) {

                //Get the key from localstorage to decrypt
                var encryptKey = window.localStorage.getItem("key");

                var decryptedDocs = [];

                //Decrypt all of the files in the data
                for(var i; i < data.length; i++)
                {
                    //Decrypt the title
                    var decryptedTitle = CryptoJS.AES.decrypt(data[i].title, encryptKey).toString(CryptoJS.enc.Latin1);

                    //Check if it decrypted correctly
                    if(!/^data:/.test(decryptedTitle)){
      					alert("Invalid decryption key! Please log in!");
                          $scope.modal.show();
      					break;
      			    }

                      //Set the Title to our decrypted object
                      decryptedDocs[i].title = decryptedTitle;

                      //Decrypt the description
                      var decryptedDesc = CryptoJS.AES.decrypt(data[i].body, encryptKey).toString(CryptoJS.enc.Latin1);

                      //Check if it decrypted correct
                      if(!/^data:/.test(decryptedDesc)){
        					alert("Invalid decryption key! Please log in!");
                            $scope.modal.show();
        					break;
        			    }

                      //Set it to decryption object
                      decryptedDocs[i].body = decryptedDesc;

                      //Decrypt all the files and images
                      for(var j = 0; j < data.images.length; j++)
                      {
                          //Init the images array
                          decryptedDocs[i].images = [];

                          //Decrypt the images/files
                          var decryptedImg = CryptoJS.AES.decrypt(data[i].images[j], encryptKey).toString(CryptoJS.enc.Latin1);

                          //check if decrypted correctly
                          if(!/^data:/.test(decryptedDesc)){
            					alert("Invalid decryption key! Please log in!");
                                $scope.modal.show();
            					break;
            			    }

                          //Save to decryption object
                          decryptedDocs[i].images[j] = decryptedImg;

                      }
                }

                //Set the decyption object
                $scope.documents = decryptedDocs;

                //Stop the spinner
                $scope.loading = false;

            }, function(){
                alert("FAILURE!");
            });
        }
    }
})

.controller('DocumentCtrl', function($scope, $stateParams) {

});
