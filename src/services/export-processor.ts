import { EventEmitter } from 'events'
import { ExportableModel } from './exportable-model'
import * as path from 'path'
import { ProcessProvider, Process, ProcessWrapper } from '../providers/process'

export class ExportProcessorService extends EventEmitter {

    protected static singleton: ExportProcessorService

    private processProvider: ProcessProvider
    private processQueue: ExportableModel[]
    private processes: Map<string, ProcessWrapper>

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
        const processWrapper = this.processProvider.createProcess(
            cliPath,
            '/shapr3dconvert',
            [
                `${model.inputFile}`,
                `--format ${model.format}`,
                `${path.resolve(__dirname + '/../../static/' + model.outputFile)}`
            ]
        )

        this.processes.set(model.id, processWrapper)

        processWrapper.on('processingFailure', () => {
            this.emit('modelProcessingFailure', model);
            this.terminateProcess(model.id)
        })

        processWrapper.on('processingInProgress', (percent: number) => {
            this.emit('modelProcessingInProgress', model, percent);
        })

        processWrapper.on('processed', () => {
            this.emit('modelProcessed', model);
            this.terminateProcess(model.id)
        })
    }

    public terminateProcess(id: string): void {
        const processWrapper = this.processes.get(id)
        processWrapper && processWrapper.kill() 
        this.processes.delete(id)
    }

    public onExit(): void {
        this.processes.forEach((processWrapper: ProcessWrapper) => {
            processWrapper.kill()
        })
    }

    public static get instance(): ExportProcessorService {
        if (!this.singleton) {
            const processProvider = ProcessProvider.instance
            this.singleton = new ExportProcessorService(processProvider)
            this.singleton.startPolling()
        }
        return this.singleton
    }

}