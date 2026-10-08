module.exports = function (req, res, next) {
  const { locals: { versionObject } } = res
  if (versionObject) {
    return versionObject(req, res, next)
  }
  next()
}
// 