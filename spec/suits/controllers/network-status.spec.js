const { NetworkStatusController } = require('../../../dist/controllers/network-status')

const responseFactory = require('../test-utils/response-factory')

describe('NetworkStatusController tests', () => {

    let controller

    beforeEach(() => {
        controller = new NetworkStatusController()
    })

    it('should return reply on echo', () => {
        const response = responseFactory()
        spyOn(response, 'send')
        spyOn(response, 'end')

        controller.echo(undefined, response)

        expect(response.send).toHaveBeenCalled()
        expect(response.send).toHaveBeenCalledWith('reply')
        expect(response.send).toHaveBeenCalledTimes(1)
        expect(response.end).toHaveBeenCalled()
        expect(response.end).toHaveBeenCalledTimes(1)
    })

})