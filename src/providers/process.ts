import * as childProcessProvider from 'child_process'
import { EventEmitter } from 'events'

export interface Process extends EventEmitter {
    stdout: EventEmitter
    stderr: EventEmitter
    kill: () => void
}

export interface ChildProcessProvider {
    execFile: (process: string, args?: string[], options?: {cwd: string}) => Process 
}

export class ProcessWrapper extends EventEmitter {

    private process: Process

    constructor(process: Process) {
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

export class ProcessProvider extends EventEmitter {

    protected static singleton: ProcessProvider

    private childProcessProvider: ChildProcessProvider

    constructor(childProcesProvider: ChildProcessProvider) {
        super()
        this.childProcessProvider = childProcesProvider
    }

    public createProcess(cwd: string, executable: string, args?: string[]): ProcessWrapper {
        const process = this.childProcessProvider.execFile.call(this.childProcessProvider, cwd + executable, args, {cwd: cwd})
        const processWrapper = new ProcessWrapper(process);
        processWrapper.listen()
        return processWrapper
    }

    public static get instance(): ProcessProvider {
        if (!this.singleton) {
            this.singleton = new ProcessProvider(childProcessProvider)
        }
        return this.singleton
    }

}