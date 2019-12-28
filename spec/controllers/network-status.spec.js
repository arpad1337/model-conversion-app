
const { NetworkStatusController } = require('../../dist/controllers/network-status');

const response = {
    send: () => {

    },
    end: () => {}
}

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
        expect(response.end).toHaveBeenCalled()
    })

})