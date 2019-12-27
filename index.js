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

    const onGracefulExit = () => {
        app.onExit()
        process.exit(0)
    }

    process.on('SIGINT', onGracefulExit);
    process.on('SIGTERM', onGracefulExit);
    process.on('SIGUSR2', onGracefulExit);

}

module.exports = {
    App,
    config
}