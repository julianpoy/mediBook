angular.module('starter.controllers', [])

//Need this to display files and things
.config(function($compileProvider, $ionicConfigProvider){

  //White list for image sanitization
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

  //Center the app title for android
  $ionicConfigProvider.navBar.alignTitle('center');
})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, Documents,
    $state, $ionicPopup, $ionicHistory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //})

  // Form data for the login modal
  $scope.loginData = {};

  //Priority value array
  $scope.priorityArray = ["Low", "Medium", "High"];

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
         if(callback){
            callback();
         }
     });
   };

   //Check For mobile Devices
   if(ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isIPad() || ionic.Platform.isWindowsPhone()){
       $scope.mobileDevice = true;
   }
   else $scope.mobileDevice = false;

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
        $state.go(stateName, params);
    }

  //Return the app state
  $scope.isCurrentState = function (stateName) {
      if(stateName == $ionicHistory.currentStateName()) return true;
      else false;
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

                    //Get the object priority
                    decryptedDocs[i].priority = data[i].priority;

                    //Get the object id
                    decryptedDocs[i]._id = data[i]._id;

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

          }, function(err){
              $scope.loading = false;
              if (err.status == 401) {
                  //Session is invalid!
                  $scope.modal.show();
                } else {
                  $scope.showAlert("Error", err.data[0].msg);
                }
          });
      }
  }

  $timeout(function(){
      //Get the users Documents
      $scope.getDocuments();
  }, 0);

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

    //Go back a page
    $scope.regBack = function () {

        //Flips the pages back!

        //Timeout to apply the variable change
        $timeout(function () {
            //Set show page one false
            $scope.showPageTwo = false;
        }, 0);

         //Timeout to show next thing
         $timeout(function () {
             //Show the next page
             $scope.showPageOne = true;
         }, 1000);
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

            $scope.getDocuments();

            //Re init the modal
            $timeout(function () {
                $scope.reInitModal();
            }, 10);
        }, function(err){
            $scope.loading = false;
            $scope.showAlert("Error", err.data.msg);
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
            $scope.loading = false;
            if (err.status == 401) {
                //Session is invalid!
                $scope.modal.show();
              } else {
                $scope.showAlert("Error", err.data.msg);
              }
        });
    }
})

.controller('NewCtrl', function($scope, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $http,
    Documents, $timeout, $cordovaFile, $window, $sce, $ionicHistory, $state) {

    //Initialize the new document
    $scope.newDoc = {};

    //Initialize the images array
    $scope.addedFiles = [];

    //Set the default priority
    $scope.newDoc.priority = 2;

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

    var reader = new FileReader();

    function base64ArrayBuffer(arrayBuffer) {
      var base64    = ''
      var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

      var bytes         = new Uint8Array(arrayBuffer)
      var byteLength    = bytes.byteLength
      var byteRemainder = byteLength % 3
      var mainLength    = byteLength - byteRemainder

      var a, b, c, d
      var chunk

      // Main loop deals with bytes in chunks of 3
      for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
      }

      // Deal with the remaining bytes and padding
      if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
      } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
      }

      return base64
    }

    //Get a photo from the gallery
    //http://learn.ionicframework.com/formulas/cordova-camera/
    $scope.getPhoto = function(event) {

        if($scope.mobileDevice)
        {
            var options = {
                quality: 75,
                maximumImagesCount: 1

            };

            $cordovaImagePicker.getPictures(options).then(function(imageData) {
                var client = new XMLHttpRequest();
                client.open('GET', imageData[0]);
                client.responseType = "arraybuffer";
                client.addEventListener("load", function() {

                    var base64 = base64ArrayBuffer(this.response)

                    document.getElementById("uploadedImage").src = "data:image/png;base64," + base64;


                  $scope.addedFiles[0] = base64;


                });
                client.send();
            }, function(err) {
                $scope.showAlert("Error opening gallery!", "Error details: " + angular.toJson(err));
            });

        $scope.blobs = [];

        //http://ngcordova.com/docs/plugins/imagePicker/
        $scope.takePhoto = function (event) {

            //Options for the Photo
            var options = {
                quality: 75,
                saveToPhotoAlbum: false
            };

            //Open the camera to take the picture
            $cordovaCamera.getPicture(options).then(function(imageData) {
                var client = new XMLHttpRequest();
                client.open('GET', imageData);
                client.responseType = "arraybuffer";
                client.addEventListener("load", function() {

                    var base64 = base64ArrayBuffer(this.response)

                    document.getElementById("uploadedImage").src = "data:image/png;base64," + base64;


                  $scope.addedFiles[0] = base64;


                });
                client.send();
            }, function(err) {
                $scope.showAlert("Error opening camera!", "Error details: " + angular.toJson(err));
            });
        }
        }
        else {

        }
    }

    //Submit the document to the backend
    $scope.submitDoc = function() {

        //Get our encrypt Key
        var encryptKey = window.localStorage.getItem("key");

        //First Encrypt the title
        var encryptTitle = CryptoJS.AES.encrypt($scope.newDoc.title, encryptKey);

        //Then Encrypt the description
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
          priority: $scope.newDoc.priority,
          images: imageArray
        };

        Documents.create(payload, function(data, status) {

            //Add document to $scope.documents
            var pushObject = {
                _id: (Math.random() * (10000000000000 - 1000) + 1000),
                title: $scope.newDoc.title,
                body: $scope.newDoc.desc,
                priority: $scope.newDoc.priority,
                images: $scope.addedFiles
            }

            $scope.documents.unshift(pushObject);

            //Success, go home, and clear the back buttons!
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $state.go('app.home');

        }, function(err){
            $scope.loading = false;
            if (err.status == 401) {
                //Session is invalid!
                $scope.modal.show();
              } else {
                $scope.showAlert("Error", err.data.msg);
              }
        });
    }
})

.controller('HomeCtrl', function($scope, $cordovaFileTransfer, User) {

    //Get the sessionToken
    if(window.localStorage.getItem("sessionToken"))
    {
        //Get the sessionToken and key
        $scope.sessionToken = window.localStorage.getItem("sessionToken");

        //Get our encrypt Key
        var encryptKey = window.localStorage.getItem("key");

        //Get the user object
        $scope.getUser = function() {

            //Create the payload
            var payload = {
                sessionToken: $scope.sessionToken
            };

            //Send to the backend
            User.get(payload, function (data, status) {

                //Success, Decrypt the data
                $scope.user = {};

                $scope.user.name = CryptoJS.AES.decrypt(data.name, encryptKey).toString(CryptoJS.enc.Latin1);
                $scope.user.dob = CryptoJS.AES.decrypt(data.dob, encryptKey).toString(CryptoJS.enc.Latin1);

            }, function (err) {
                $scope.loading = false;
                if (err.status == 401) {
                    //Session is invalid!
                    $scope.modal.show();
                  } else {
                    $scope.showAlert("Error", err.data[0].msg);
                  }
            })

        }

        //Get the User
        $scope.getUser();
    }
})

.controller('ProfileCtrl', function($scope, $cordovaFileTransfer, User, $state, $ionicHistory) {

    //Get the sessionToken, and key
    $scope.sessionToken = window.localStorage.getItem("sessionToken");
    var encryptKey = window.localStorage.getItem("key");

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

            //Initialize user input
            $scope.userInput = {};

            //Set up all the ng-model
            $scope.userInput.email = $scope.user.username
            $scope.userInput.name = CryptoJS.AES.decrypt($scope.user.name, encryptKey).toString(CryptoJS.enc.Latin1);;
            $scope.userInput.dob = CryptoJS.AES.decrypt($scope.user.dob, encryptKey).toString(CryptoJS.enc.Latin1);;

        }, function (err) {
            $scope.loading = false;
            if (err.status == 401) {
                //Session is invalid!
                $scope.modal.show();
              } else {
                $scope.showAlert("Error", err.data.msg);
              }
        })

    }

    //Get the User
    $scope.getUser();



    //Update the user and send to the backend
    $scope.updateUser = function () {

        //Encrypt the stuff!
        var encryptName = CryptoJS.AES.encrypt($scope.userInput.name, encryptKey);
        var encryptDob = CryptoJS.AES.encrypt($scope.userInput.dob, encryptKey);

        //Create the payload
        var payload = {
            sessionToken: $scope.sessionToken,
            username: $scope.userInput.email,
            name: encryptName.toString(),
            dob: encryptDob.toString()
        }

        //Send to the backend
        User.update(payload, function (data, status) {

            //Success, go home,a nd clear the back buttons!
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $state.go('app.home');

        }, function () {
            //FAILURE
            console.log("GAME OVER! Could not UPDATE user");
        })
    };
})

.controller('DocumentCtrl', function($scope, $stateParams, Documents, $ionicHistory, $cordovaFileOpener2) {

    //Disable back when returning to home
    $ionicHistory.nextViewOptions({
        disableBack: true
    });


    $scope.document = {};
    for(var i=0; i < $scope.documents.length; i++){
        if($scope.documents[i]._id == $stateParams.documentId){
            $scope.document = $scope.documents[i];
        }
    }

    if($scope.document.images && $scope.document.images.length > 0)
    {
        document.getElementById("documentImage").src = "data:image/png;base64," + $scope.document.images[0];
    }

    //Open the image in gallery, not bring used, couldnt implmeent in time
    $scope.openImage = function () {

        //Open the image in document
        $cordovaFileOpener2.open(
            "data:image/png;base64," + $scope.document.images[0],
            "image/*"
          ).then(function() {
              // file opened successfully
              conosole.log("hi!");

          }, function(err) {
              console.log(err);
              // An error occurred. Show a message to the user
              $scope.showAlert("Error, could not open this image file...");
          });

    }
})


.controller('EmergencyCtrl', function($scope, $stateParams, Documents, $ionicHistory) {

    //Disable back when returning to home
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

});
