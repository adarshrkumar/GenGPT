const fs = require('fs');

var requestImage = require('./requestImage').default

function uploadImageFromWeb(url) {
  var filename = url
  if (filename.includes('://')) {
    filename = filename.split('://')[1]
    if (filename.includes('/')) {
      filename = filename.split('/')
      if (filename.length === 2 && filename[1] === '') {
        filename = filanems[0]
      }
      else {
        filename = filename.pop()
        if (filename.includes('?')) filename = filename.split('?')[0]
      }
    }
  }
  else filename = 'unnamed.png'

  requestImage(url, function(err, res, body) {
    fs.writeFileSync(`${__dirname}/temp/${filename}`)
  })

  return filename
}

exports.default = uploadImageFromWeb