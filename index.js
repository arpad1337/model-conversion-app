const config = require('./config')
const App = require('./dist').default

if (require && require.main === module) { 

    const app = new App(config)
    app.listen()

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