import * as childProcessPackage from 'child_process'
import { EventEmitter } from 'events'
import { ProcessWrapper } from '../models/process-wrapper'
import { ProcessProvider } from '../models/process-provider'

export interface ChildProcess extends EventEmitter {
    stdout: EventEmitter
    stderr: EventEmitter
    kill(): void
}

export interface ChildProcessPackage {
    execFile(process: string, args?: string[], options?: {cwd: string}): ChildProcess 
}

export class ChildProcessWrapper extends EventEmitter implements ProcessWrapper {

    private process: ChildProcess

    constructor(process: ChildProcess) {
        super()
        this.process = process
    }

    public listen(): void {
        this.process.on('close', (code) => {
            if (code === 0) {
                this.emit('processed')
                this.process.kill()
                return
            }
            this.emit('processingFailure')
            this.process.kill()
        })
        this.process.stdout.on('data', (fragment: any) => {
            const data = fragment.toString()
            if (data.indexOf('###') === 0) {
                const percent = data.match(/[0-9]+/ig)
                if (percent) {
                    this.emit('processingInProgress', percent[0])
                }
            }
        })
        this.process.stderr.on('data', () => {
            this.emit('processingFailure')
            this.process.kill()
        })

        
        this.process.on('error', () => {
            this.emit('processingFailure')
            this.process.kill()
        })
    }

    public kill(): void {
        this.process.kill()
    }

}

export class ChildProcessProvider extends EventEmitter implements ProcessProvider {

    protected static singleton: ChildProcessProvider

    private childProcessProvider: ChildProcessPackage

    constructor(childProcesProvider: ChildProcessPackage) {
        super()
        this.childProcessProvider = childProcesProvider
    }

    public createProcess(cwd: string, executable: string, args?: string[]): ChildProcessWrapper {
        const process = this.childProcessProvider.execFile.call(this.childProcessProvider, cwd + executable, args, {cwd: cwd})
        const processWrapper = new ChildProcessWrapper(process);
        processWrapper.listen()
        return processWrapper
    }

    public static get instance(): ChildProcessProvider {
        if (!this.singleton) {
            this.singleton = new ChildProcessProvider(childProcessPackage)
        }
        return this.singleton
    }

}