const config = require('./config')
const App = require('./dist').default

if (require && require.main === module) { 
    const app = new App(config)
    app.listen((err) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
    })

    const onExit = () => {
        app.onExit()
        process.exit(0)
    }

    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);
    process.on('SIGUSR2', onExit);
}

module.exports = {
    App,
    config
}