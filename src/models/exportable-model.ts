import { FileFormat } from 'model-conversion-async/src/lib/file-converter'

export type FileStatus = 'waiting' | 'in-progress' | 'processed' | 'error'

export interface ExportableModel {
    inputFile: string
    progress: number
    outputFile: string
    format: FileFormat
    status: FileStatus
    id: string
    filename: string 
    createdAt: string
    updatedAt: string
}