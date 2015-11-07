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

  if(window.localStorage.getItem("sessionToken"))  $scope.sessionToken = window.localStorage.getItem("sessionToken");

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

  $scope.documents = {};

  //Query the backend for the documents
  $scope.getDocuments = function () {

      //Check if we have the documents already
      if($scope.sessionToken)
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
            alert(angular.toJson(err));
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
        }, function(){
            alert("FAILURE!");
        });
    }
})

.controller('NewCtrl', function($scope, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $http, Documents, $timeout) {

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
            $scope.addedFiles.push(imageData);

        }, function(err) {
            alert("Failed because: " + err);
            console.log('Failed because: ' + err);
        });
    }

    //Convert file url to Blob
    // function dataURItoBlob(dataURI) {
    //     // convert base64 to raw binary data held in a string
    //     // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    //     var byteString = atob(dataURI.split(',')[1]);
    //
    //     // separate out the mime component
    //     var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    //
    //     // write the bytes of the string to an ArrayBuffer
    //     var ab = new ArrayBuffer(byteString.length);
    //     var ia = new Uint8Array(ab);
    //     for (var i = 0; i < byteString.length; i++) {
    //         ia[i] = byteString.charCodeAt(i);
    //     }
    //
    //     // write the ArrayBuffer to a blob, and you're done
    //     var bb = new BlobBuilder();
    //     bb.append(ab);
    //     return bb.getBlob(mimeString);
    // }

    //Submit the document to the backend
    $scope.submitDoc = function() {

        //Our backend url and the file we would like to upload
        var uploadUrl = "http://jnode.ngrok.kondeo.com:8080/documents/file";

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
            console.log(encrypted.toString());

            var file = new File([encrypted], "filename");

            //console.log($scope.addedFiles[i]);


            $cordovaFileTransfer.upload(uploadUrl, file, options, true)
            .then(function(result) {
                var imageName = JSON.parse(result.response);

                imageArray.push(imageName.filename);

              }, function(err) {
                alert(err);
              }, function (progress) {
                $timeout(function () {
                  $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                })
              });
        }


          //Now create our payload to send to the backend
          var payload = {
              sessionToken: $scope.sessionToken,
              title: encryptTitle.toString(),
              body: encryptDesc.toString(),
              images: imageArray
          };

          Documents.create(payload, function(data, status) {
              alert("dfd2");

              //Go Back Home
          }, function(err){
              alert(angular.toJson(err));
          });
    }
})

.controller('HomeCtrl', function($scope, $cordovaFileTransfer, Documents) {


})

.controller('DocumentCtrl', function($scope, $stateParams) {

});
