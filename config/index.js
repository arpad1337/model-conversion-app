module.exports = {
    port: process.env.NODE_PORT || 1337,
    staticPath: './static',
    middlewares: [
        'extract-ip',
        'logging'
    ],
    routes: [
        {
            method: 'GET',
            path: '/',
            controller: 'home',
            action: 'index'
        }
    ]
}