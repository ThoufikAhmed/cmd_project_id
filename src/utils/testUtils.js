const sinon = require('sinon')

const mockRequest = (params, body, query) => {
  return {
    headers: { version: 'testVersion' },
    params,
    body,
    query
  }
}

const mockResponse = () => {
  const res = {}
  return Object.assign(res, {
    status: sinon.stub().returns(res),
    json: sinon.stub().returns(res),
    locals: { }
  })
}

module.exports = {
  mockRequest,
  mockResponse
}
