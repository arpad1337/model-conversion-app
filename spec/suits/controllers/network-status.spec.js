const { NetworkStatusController } = require('../../../dist/controllers/network-status')

const response = require('../test-utils/response')

describe('NetworkStatusController tests', () => {

    let controller

    beforeEach(() => {
        controller = new NetworkStatusController()
    })

    it('should return reply', () => {
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