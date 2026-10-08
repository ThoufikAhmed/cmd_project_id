module.exports = function (tokens, req, res) {
  return [
    tokens['request-id'](res),
    tokens['remote-addr'](req),
    tokens['remote-user'](req),
    tokens.date(),
    tokens.method(req),
    tokens.url(req, res),
    'HTTP/',
    tokens['http-version'](req),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['user-agent'](req)
  ].join(' ')
}
