module.exports = {
    port: process.env.NODE_PORT || 1337,
    staticPath: './static',
    middlewares: [
        'extract-ip',
        'logging',
        'error-handler'
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
            action: 'getByID'
        },
        {
            method: 'POST',
            path: '/v1/models',
            controller: 'exportable-model',
            action: 'createNewModel',
            middlewares: ['multipart-parser']
        }

    ]
}