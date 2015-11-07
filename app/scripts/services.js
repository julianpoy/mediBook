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
        }

    } );

}])

.factory('Document', ['$resource', function($resource) {

    return $resource('http://mangorabo.ngrok.kondeo.com:8080/' + 'documents',
        {}, {
            create: {
                method: 'POST',
                params: {},
                isArray: false
            }

        });

}]);
