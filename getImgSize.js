const sizeOf = require('image-size')

function getSize(path) {
  if (path.startsWith('/')) path = path.substring(1)
  var dimensions = sizeOf(path)
  return dimensions
}

exports.default = getSize;