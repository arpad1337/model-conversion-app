import * as processProvider from 'child_process'
import { EventEmitter } from 'events'
import { ExportableModel } from './exportable-model'
import * as path from 'path'

export interface Process extends EventEmitter {
    stdout: EventEmitter,
    stderr: EventEmitter
    kill: () => void
}

export interface ProcessProvider {
    spawn: (process: string, args?: string[]) => Process
}

export class ExportProcessorService extends EventEmitter {

    private static singleton: ExportProcessorService

    private processProvider: ProcessProvider
    private processQueue: ExportableModel[]

    constructor(processProvider: ProcessProvider) {
        super()
        this.processProvider = processProvider
        this.processQueue = []
    }

    public scheduleProcessing(model: ExportableModel): void {
        console.log('SCHEDULING MODEL', model)
        this.processQueue.push(model)
    }

    private startPolling(): void {
        setInterval(() => this.onPoll(), 3000)
    }

    private onPoll(): void {
        const model = this.processQueue.shift();
        if (!model) {
            return
        }
        this.startProcessing(model)
    }

    private startProcessing(model: ExportableModel): void {
        console.log('SPAWNING PROCESS')
        const process = this.processProvider.spawn(
            'cd '+ path.resolve('node_modules/model-conversion-async') + "&& ./shapr3dconvert" + ` ${model.inputFile} --format ${model.format} ${path.resolve(model.outputFile)}`,
            []
        )
        process.on('close', (code) => {
            if (code === 0) {
                console.log('SUCCESS', model)
                this.emit('modelProcessed', model)
                return
            }
            console.log('FAILURE1', model)
            this.emit('modelProcessingFailure', model)
        })
        process.stdout.on('data', (fragment: any) => {
            const data = fragment.toString()
            if (data.indexOf('###') === 0) {
                const percent = data.match(/[0-9]{2}/ig)
                if (percent) {
                    console.log('PROGRESS', model)
                    this.emit('modelProcessingInProgress', model, percent)
                }
            }
        })
        process.stderr.on('data', (err) => {
            console.log(err.toString())
            console.log('FAILURE2', model)
            this.emit('modelProcessingFailure', model)
            process.kill()
        })
    }

    static get instance(): ExportProcessorService {
        if (!this.singleton) {
            this.singleton = new ExportProcessorService(processProvider)
            this.singleton.startPolling()
        }
        return this.singleton
    }

}