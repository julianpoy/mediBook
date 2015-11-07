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

    return $resource('http://localhost:3000/' + 'documents',
        {}, {
            create: {
                method: 'POST',
                params: {},
                isArray: false
            },

           get: {
               method: 'GET',
               params: {},
               isArray: true
            }

        });

}]);
