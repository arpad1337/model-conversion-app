import * as processProvider from 'child_process'
import { EventEmitter } from 'events'
import { ExportableModel } from './exportable-model'
import * as path from 'path'

export interface Process extends EventEmitter {
    stdout: EventEmitter
    stderr: EventEmitter
    kill: () => void
}

export interface ProcessProvider {
    execFile: (process: string, args?: string[], options?: {cwd: string}) => Process
}

export class ExportProcessorService extends EventEmitter {

    private static singleton: ExportProcessorService

    private processProvider: ProcessProvider
    private processQueue: ExportableModel[]
    private processes: Map<string, Process>

    constructor(processProvider: ProcessProvider) {
        super()
        this.processProvider = processProvider
        this.processQueue = []
        this.processes = new Map()
    }

    public scheduleProcessing(model: ExportableModel): void {
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
        const cliPath = path.resolve(__dirname + '/../../node_modules/model-conversion-async');
        const process = this.processProvider.execFile(
            cliPath + '/shapr3dconvert',
            [
                `${model.inputFile}`,
                `--format ${model.format}`,
                `${path.resolve(__dirname + '/../../static/' + model.outputFile)}`
            ],
            {cwd: cliPath}
        )

        this.processes.set(model.id, process)

        process.on('close', (code) => {
            if (code === 0) {
                this.emit('modelProcessed', model)
                this.terminateProcess(model.id)
                return
            }
            this.emit('modelProcessingFailure', model)
            this.terminateProcess(model.id)
        })
        process.stdout.on('data', (fragment: any) => {
            const data = fragment.toString()
            if (data.indexOf('###') === 0) {
                const percent = data.match(/[0-9]+/ig)
                if (percent) {
                    this.emit('modelProcessingInProgress', model, percent[0])
                }
            }
        })
        process.stderr.on('data', () => {
            this.emit('modelProcessingFailure', model)
            this.terminateProcess(model.id)
        })
        process.on('error', () => {
            this.emit('modelProcessingFailure', model)
            this.terminateProcess(model.id)
        })
    }

    public terminateProcess(id: string): void {
        const process = this.processes.get(id)
        process && process.kill() 
        this.processes.delete(id)
    }

    public onExit(): void {
        this.processes.forEach((process: Process) => {
            process && process.kill()
        })
    }

    public static get instance(): ExportProcessorService {
        if (!this.singleton) {
            this.singleton = new ExportProcessorService(processProvider)
            this.singleton.startPolling()
        }
        return this.singleton
    }

}