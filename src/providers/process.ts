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

export class ProcessProvider {

    protected static singleton: ProcessProvider

    private childProcessProvider: ChildProcessProvider

    constructor(childProcesProvider: ChildProcessProvider) {
        this.childProcessProvider = childProcesProvider
    }

    public execFile(process: string, args?: string[], options?: {cwd: string}): Process {
        return this.childProcessProvider.execFile.call(this.childProcessProvider, process, args, options)
    }

    public static get instance(): ProcessProvider {
        if (!this.singleton) {
            this.singleton = new ProcessProvider(childProcessProvider)
        }
        return this.singleton
    }

}