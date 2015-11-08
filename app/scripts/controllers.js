angular.module('starter.controllers', [])

//Need this to display files and things
.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, Documents, $state) {

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
    if(window.localStorage.getItem("sessionToken"))
    {
        //Save the sessiontoken
        $scope.sessionToken = window.localStorage.getItem("sessionToken");

        //Get the documents
        $scope.getDocuments();
    }
    else {
        //Open the login modal
        $scope.modal.show();
    }
  });

  // An alert dialog
   $scope.showAlert = function(title, body, callback) {
     var alertPopup = $ionicPopup.alert({
       title: title,
       template: body
     });
     alertPopup.then(function(res) {
       callback();
     });
   };

   //Listen for offline event
   document.addEventListener("offline", offlineEvent(), false);
     function offlineEvent() {
         // Handle the offline event
         $scope.showAlert("You are offline!", "This app is based on a web backend, and requires internet connection to function correctly.");
     }

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

    //Go to a new state
    $scope.navigatePage = function(stateName, params) {
        console.log(params);
        $state.go(stateName, params);
    }

  //Go to a new state
  $scope.navigatePage = function(stateName) {
      $state.go(stateName);
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

  $scope.documents = [];
  $scope.loading = false;

  //Query the backend for the documents
  $scope.getDocuments = function () {

      //Check if we have the documents already
      if($scope.sessionToken)
      {

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
              for(var i=0; i < data.length; i++)
              {
                  decryptedDocs[i] = {};

                  //Decrypt the title
                  var decryptedTitle = CryptoJS.AES.decrypt(data[i].title, encryptKey).toString(CryptoJS.enc.Latin1);

                  //Check if it decrypted correctly
                  if(/^data:/.test(decryptedTitle)){
                      $scope.showAlert("Invalid decryption key!", "Please use the side menu to log in again");
                        $scope.modal.show();
                      break;
                  }

                    //Set the Title to our decrypted object
                    decryptedDocs[i].title = decryptedTitle;

                    //Decrypt the description
                    var decryptedDesc = CryptoJS.AES.decrypt(data[i].body, encryptKey).toString(CryptoJS.enc.Latin1);

                    //Check if it decrypted correct
                    if(/^data:/.test(decryptedDesc)){
                          $scope.showAlert("Invalid decryption key!", "Please use the side menu to log in again");
                          $scope.modal.show();
                          break;
                      }

                    //Set it to decryption object
                    decryptedDocs[i].body = decryptedDesc;

                    //Init the images array
                    decryptedDocs[i].images = [];

                    //Decrypt all the files and images
                    for(var j = 0; j < data[i].images.length; j++)
                    {

                        //Decrypt the images/files
                        var decryptedImg = CryptoJS.AES.decrypt(data[i].images[j], encryptKey).toString(CryptoJS.enc.Latin1);

                        //check if decrypted correctly
                        if(/^data:/.test(decryptedImg)){
                              $scope.showAlert("Invalid decryption key!", "Please use the side menu to log in again");
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
              $scope.showAlert("Error processing!", "Error details: " + angular.toJson(err));
              //Show a login
              $scope.loading = false;
          });
      }
  }

  //Get the users Documents
  $scope.getDocuments();

// END APP CONTROLLER
})

.controller('AuthCtrl', function($scope, $timeout, User) {

    $scope.showPageOne = true;
    $scope.confirmed = false;
    $scope.regData = {};
    $scope.loginData = {};
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

        console.log("boo");
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

            $scope.getDocuments();

            //Re init the modal
            $timeout(function () {
                $scope.reInitModal();
            }, 10);
        }, function(err){
            $scope.showAlert("Error registering!", "Error details: " + angular.toJson(err));
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

            $scope.getDocuments();

            //Re init the modal
            $timeout(function () {
                $scope.reInitModal();
            }, 10);
        }, function(err){

        });
    }
})

.controller('NewCtrl', function($scope, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $http,
    Documents, $timeout, $cordovaFile, $window) {

    //Initialize the new document
    $scope.newDoc = {};

    //Initialize the images array
    $scope.addedFiles = [];

    //Grab the sessionToken
    $scope.sessionToken = sessionToken = window.localStorage.getItem("sessionToken");

    //Initialize the files array
    $scope.uploadImage;

    $scope.docSelect = function(){
        ionic.trigger('click', { target: document.getElementById('fileInput') });
    }

    // $scope.getDoc = function(target){
    //     var file = target.files[0];
    //     $scope.addedFiles.push(file.name);
    //     $scope.$apply();
    // };

    //Get a photo from the gallery
    //http://learn.ionicframework.com/formulas/cordova-camera/
    $scope.getPhoto = function() {

    var options = {
        quality: 75,
        maximumImagesCount: 1

    };

    $cordovaImagePicker.getPictures(options).then(function(imageData) {
        $scope.addedFiles.push(imageData[0]);
    }, function(err) {
        $scope.showAlert("Error opening gallery!", "Error details: " + angular.toJson(err));
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
            $scope.addedFiles.push(imageData);

        }, function(err) {
            $scope.showAlert("Error opening camera!", "Error details: " + angular.toJson(err));
        });
    }

    //Submit the document to the backend
    $scope.submitDoc = function() {

        //Get our encrypt Key
        var encryptKey = window.localStorage.getItem("key");

        //First Encrypt the title
        var encryptTitle = CryptoJS.AES.encrypt($scope.newDoc.title, encryptKey);

        //Then Encrypt the description
        //First Encrypt the title
        var encryptDesc = CryptoJS.AES.encrypt($scope.newDoc.desc, encryptKey);

        //Our array of images
        var imageArray = [];

        //Options for the file upload
        var options = {};

        for(var i = 0; i < $scope.addedFiles.length; i++)
        {
			var encrypted = CryptoJS.AES.encrypt($scope.addedFiles[i], encryptKey);

            imageArray.push(encrypted.toString());
        }

        //Now create our payload to send to the backend
        var payload = {
          sessionToken: $scope.sessionToken,
          title: encryptTitle.toString(),
          body: encryptDesc.toString(),
          images: imageArray
        };

        Documents.create(payload, function(data, status) {

          //Go Back Home
        }, function(err){
          $scope.showAlert("Error creating document!", "Error details: " + angular.toJson(err));
        });
    }
})

.controller('HomeCtrl', function($scope, $cordovaFileTransfer, User) {

    //Get the sessionToken
    if(window.localStorage.getItem("sessionToken"))
    {
        $scope.sessionToken = window.localStorage.getItem("sessionToken");

        //Get the user object
        $scope.getUser = function() {

            //Create the payload
            var payload = {
                sessionToken: $scope.sessionToken
            };

            //Send to the backend
            User.get(payload, function (data, status) {

                //Success
                $scope.user = data;

            }, function (err) {
                //FAILURE
                console.log("GAME OVER! Could not get user");

                //Set loading to false
                $sscope.loading = false;

                //Show the login modal
                $scope.modal.show();
            })

        }

        //Get the User
        $scope.getUser();
    }

})

.controller('ProfileCtrl', function($scope, $cordovaFileTransfer, User) {

    //Get the sessionToken
    $scope.sessionToken = window.localStorage.getItem("sessionToken");

    //Get the user object
    $scope.getUser = function() {

        //Create the payload
        var payload = {
            sessionToken: $scope.sessionToken
        };

        //Send to the backend
        User.get(payload, function (data, status) {

            //Success
            $scope.user = data;

        }, function () {
            $scope.showAlert("Your session is invalid", "Please use the sidebar to login again");
        })

    }

    //Get the User
    $scope.getUser();
})

.controller('DocumentCtrl', function($scope, $stateParams, Documents) {
    $scope.document = {};
    for(var i=0;i<$scope.documents.length;i++){
        if($scope.documents[i]._id == $stateParams.documentId){
            $scope.document = $scope.documents[i];
        }
    }
});
