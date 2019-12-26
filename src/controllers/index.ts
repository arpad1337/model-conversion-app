import { Controller } from './controller'
import { HomeController } from './home'

export * from './controller'
export * from './home'
export const controllerMapping = new Map<string, Controller>([
    [
        'home', HomeController.instance
    ]
])