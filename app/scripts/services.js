angular.module('starter.services', ['ngResource'])

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
        },

        get: {
            method: 'GET',
            params: { Id: '' },
            isArray: false
        }

    } );

}])

.factory('Documents', ['$resource', function($resource) {

    return $resource('http://jnode.ngrok.kondeo.com:8080/' + 'documents/:Id',
        { Id: '@Id' }, {
            create: {
                method: 'POST',
                params: { Id: '' },
                isArray: false
            },

           get: {
               method: 'GET',
               params: { Id: '' },
               isArray: true
           },

           single: {
               method: 'GET',
               params: { Id: '@Id' },
               isArray: false
            }

        });

}]);
