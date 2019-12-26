import { Controller } from './controller'
import { NetworkStatusController } from './network-status'
import { ExportableModelController } from './exportable-model'

export * from './controller'
export * from './network-status'
export const controllerMapping = new Map<string, Controller>([
    [
        'network-status', NetworkStatusController.instance
    ],
    [
        'exportable-model', ExportableModelController.instance
    ]
])