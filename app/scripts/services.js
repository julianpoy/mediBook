angular.module('starter.services', ['ngResource'])

.factory('User', ['$resource', function($resource) {

return $resource( 'http://jnode.ngrok.kondeo.com:8080' + '/users/:Id',
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
        },

        update: {
            method: 'PUT',
            params: { Id: '' },
            isArray: false
        }

    } );

}])

.factory('Emergency', ['$resource', function($resource) {

return $resource( 'http://jnode.ngrok.kondeo.com:8080' + '/users/emergency',
    { id: '@id' }, {
        go: {
            method: 'POST',
            params: { id: '@id' },
            isArray: false
        },

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
}])

.factory('DocumentById', ['$resource', function($resource) {

return $resource( 'http://jnode.ngrok.kondeo.com:8080' + '/documents/:id',
    { id: '@id' }, {
        get: {
            method: 'GET',
            params: { id: '@id' },
            isArray: false
        },
        delete: {
            method: 'DELETE',
            params: { id: '@id' },
            isArray: false
        }

    } );

}]);
