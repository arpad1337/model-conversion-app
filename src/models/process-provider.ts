import { ProcessWrapper } from "./process-wrapper"

export interface ProcessProvider {
    createProcess(executable: string, args?: string[], cwd?: string): ProcessWrapper
}