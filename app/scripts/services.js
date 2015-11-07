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

.factory('User', ['$resource', function($resource) {

return $resource( 'http://jnode.ngrok.kondeo.com:8080/' + 'users/:Id',
    { Id: '@Id' }, {
        join: {
            method: 'POST',
            params: { Id: 'join' },
            isArray: false
        },

        login: {
            method: 'POST',
            params: { Id: 'login' },
            isArray: false
        }

    } );

}])

factory('Document', ['$resource', function($resource) {

return $resource( 'http://jnode.ngrok.kondeo.com:8080/' + 'documents/:Id',
    { Id: '@Id' }, {
        join: {
            method: 'POST',
            params: { Id: '' },
            isArray: false
        }

    } );

}]);;
