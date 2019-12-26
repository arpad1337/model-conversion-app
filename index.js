const config = require('./config')
const App = require('./dist').default
const app = new App(config)
app.listen()