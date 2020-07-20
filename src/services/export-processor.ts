import { EventEmitter } from 'events'
import { ExportableModel } from '../models/exportable-model'
import * as path from 'path'
import { ProcessWrapper } from '../models/process-wrapper'
import { ProcessProvider } from '../models/process-provider'
import { ProcessProvider as ProcessProviderGetter } from '../providers/process'
import * as os from 'os'

export class ExportProcessorService extends EventEmitter {

    protected static singleton: ExportProcessorService

    private processProvider: ProcessProvider
    private processQueue: ExportableModel[]
    private processes: Map<string, ProcessWrapper>
    private concurrentProcessesCount: number;

    constructor(processProvider: ProcessProvider) {
        super()
        this.processProvider = processProvider
        this.processQueue = []
        this.processes = new Map()
        this.concurrentProcessesCount = os.cpus().length;
    }

    public scheduleProcessing(model: ExportableModel): void {
        this.processQueue.push(model)
    }

    private startPolling(): void {
        setInterval(() => this.onPoll(), 3000)
    }

    private onPoll(): void {
        if (this.processes.size === this.concurrentProcessesCount) {
            return
        }
        const model = this.processQueue.shift()
        if (!model) {
            return
        }
        this.startProcessing(model)
    }

    private startProcessing(model: ExportableModel): void {
        const cliPath = path.resolve(__dirname + '/../../node_modules/model-conversion-async');
        const processWrapper = this.processProvider.createProcess(
            '/shapr3dconvert',
            [
                `${model.inputFile}`,
                `--format ${model.format}`,
                `${path.resolve(__dirname + '/../../static/' + model.outputFile)}`
            ],
            cliPath
        )

        this.processes.set(model.id, processWrapper)

        processWrapper.on('processingFailure', () => {
            this.emit('modelProcessingFailure', model)
            this.terminateProcess(model.id)
            this.onPoll()
        })

        processWrapper.on('processingInProgress', (percent: number) => {
            this.emit('modelProcessingInProgress', model, percent);
        })

        processWrapper.on('processed', () => {
            this.emit('modelProcessed', model)
            this.terminateProcess(model.id)
            this.onPoll()
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
            const processProvider = ProcessProviderGetter.instance
            this.singleton = new ExportProcessorService(processProvider)
            this.singleton.startPolling()
        }
        return this.singleton
    }

}
