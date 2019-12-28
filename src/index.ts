import * as express from 'express'
import { Application } from 'express'
import { controllerMapping } from './controllers'
import { middlewareMapping, ErrorHandlerMiddleware } from './middlewares'
import { DatabaseProvider } from './providers'
import { ExportProcessorService } from './services/export-processor'

export type HTTPMethod = 'GET' | 'POST'| 'PUT' | 'DELETE'

export interface Route {
    method: HTTPMethod
    path: string
    controller: string
    action: string,
    middlewares?: string[]
}

export interface AppConfig { 
    port: number
    routes: Route[] 
    middlewares: string[]
    staticPath: string
}

export default class App {

    private _port: number
    private app: Application
    private middlewares: string[]
    private routes: Route[]
    private staticPath: string

    constructor(config: AppConfig) {
        this._port = config.port || 1337
        this.routes = config.routes || []
        this.middlewares = config.middlewares || []
        this.staticPath = config.staticPath || './static'
        this.app = express()
    }

    public get port() {
        return this._port
    }

    private setup(): void {
        this.app.use(express.static(this.staticPath))
        this.middlewares.forEach((middleware: string) => {
            this.app.use(middlewareMapping.get(middleware).handle.bind(middlewareMapping.get(middleware)))
        })
        this.bindRoutes()
        const errorHandler = new ErrorHandlerMiddleware()
        this.app.use(errorHandler.handle.bind(errorHandler))
    }

    private bindRoutes(): void {
        this.routes.forEach((route: Route) => {
            let handlers = [controllerMapping.get(route.controller)[route.action].bind(controllerMapping.get(route.controller))];
            if (route.middlewares) {
                const middlewares = []
                route.middlewares.forEach((middleware: string) => {
                    middlewares.push(middlewareMapping.get(middleware).handle.bind(middlewareMapping.get(middleware)))
                })
                handlers = middlewares.concat(handlers)
            }
            this.app[route.method.toLowerCase()](route.path, ...handlers)
        })
    }

    public listen(cb: Function): void {
        this.setup()
        this.app.listen(this._port, "0.0.0.0", (err) => {
            cb && cb(err)
        })
    }

    public onExit() {
        DatabaseProvider.instance.commit();
        ExportProcessorService.instance.onExit()
    }

}