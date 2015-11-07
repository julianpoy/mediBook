angular.module('starter.services', ['ngResource'])

.factory('User', ['$resource', function($resource) {

return $resource( 'http://localhost:3000/' + 'users/:Id',
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

.factory('Documents', ['$resource', function($resource) {

return $resource( 'http://mangorabo.ngrok.kondeo.com:8080' + 'documents',
    { Id: '@Id' }, {
        get: {
            method: 'GET',
            params: { Id: '' },
            isArray: true
        }

    } );

}]);
