import * as express from 'express'
import { Application, Request, Response } from 'express'
import { controllerMapping } from './controllers'
import { middlewareMapping } from './middlewares'
import { DatabaseProvider } from './providers'

export type HTTPMethod = 'GET' | 'POST'| 'PUT'

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

    private port: number
    private app: Application
    private middlewares: string[]
    private routes: Route[]
    private staticPath: string

    constructor(config: AppConfig) {
        this.port = config.port || 3000
        this.routes = config.routes || []
        this.middlewares = config.middlewares || []
        this.staticPath = config.staticPath
        this.app = express()
    }

    private setup(): void {
        this.app.use(express.static(this.staticPath))
        this.middlewares.forEach((middleware: string) => {
            this.app.use(middlewareMapping.get(middleware).handle)
        })
        this.bindRoutes()
    }

    private bindRoutes(): void {
        this.routes.forEach((route: Route) => {
            let handlers = [controllerMapping.get(route.controller)[route.action].bind(controllerMapping.get(route.controller))];
            if (route.middlewares) {
                const middlewares = []
                route.middlewares.forEach((middleware: string) => {
                    middlewares.push(middlewareMapping.get(middleware).handle)
                })
                handlers = middlewares.concat(handlers)
            }
            this.app[route.method.toLowerCase()](route.path, ...handlers)
        })
    }

    public listen(): void {
        this.setup()
        this.app.listen(this.port, "0.0.0.0", () => {
            console.log('Application listening on port', this.port)
        })
    }

    public onExit() {
        DatabaseProvider.instance.commit();
    }

}