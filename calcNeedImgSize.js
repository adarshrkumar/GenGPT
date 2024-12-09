var getSize = require('./getImgSize').default;

function calcNeededSize(path) {
  var size = getSize(path)
  var oHeight = size.height
  var oWidth = size.width

  var orientation = 's'
  if (oHeight > oWidth) orientation = 'p'
  if (oHeight < oWidth) orientation = 'l'

  var nWidth = '1024'
  var nHeight = '1024'
  
  if (orientation == 'p') {
    nHeight = '1792'
  }
  if (orientation == 'l') {
    nWidth = '1792'
  }

  return {
    size: `${nWidth}x${nHeight}`, 
    object: {height: nHeight, width: nWidth}
  }
}

exports.default = calcNeededSize