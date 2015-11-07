angular.module('starter.services', ['ngResource'])

//Function to use the cordova camera on ionic
.factory('Camera', ['$q', function($q) {

return {
  getPicture: function(options) {
    var q = $q.defer();

    navigator.camera.getPicture(function(result) {
      // Do any magic you need
      q.resolve(result);
    }, function(err) {
      q.reject(err);
    }, options);

    return q.promise;
  }
}
}])

.factory('Book', ['$resource', function($resource) {

return $resource( 'http://dev.kondeo.com/mwwwordpairs/backend/' + 'users.php/:Id',
    { Id: '@Id' }, {
        register: {
            method: 'POST',
            params: { Id: 'register' },
            isArray: false
        },

        login: {
            method: 'POST',
            params: { Id: 'login' },
            isArray: false
        }

    } );

}]);
