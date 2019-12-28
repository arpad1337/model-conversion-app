import { ProcessWrapper } from "./process-wrapper"

export interface ProcessProvider {
    createProcess(cwd: string, executable: string, args?: string[]): ProcessWrapper
}