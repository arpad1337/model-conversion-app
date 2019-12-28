export class APIError extends Error {

    public code: number

    constructor(message, code) {
        super()
        this.message = message
        this.code = code
    }

}