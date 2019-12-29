module.exports = {
    port: process.env.NODE_PORT || 1337,
    staticPath: './static',
    middlewares: [
        'compression',
        'extract-ip',
        'logging'
    ],
    routes: [
        
        {
            method: 'GET',
            path: '/v1/echo',
            controller: 'network-status',
            action: 'echo'
        },
        
        {
            method: 'GET',
            path: '/v1/models',
            controller: 'exportable-model',
            action: 'getAll'
        },
        {
            method: 'GET',
            path: '/v1/models/:id',
            controller: 'exportable-model',
            action: 'getById'
        },
        {
            method: 'POST',
            path: '/v1/models',
            controller: 'exportable-model',
            action: 'createNewModel',
            middlewares: ['multipart-parser']
        },
        {
            method: 'DELETE',
            path: '/v1/models/:id',
            controller: 'exportable-model',
            action: 'deleteModel',
        }

    ]
}