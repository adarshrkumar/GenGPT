const request = require('request');

function requestImage(url, callback) {
  request.get(
    { url: url }, 
    function(error, result, body) {
      callback(error, result, body)
    }
  )
}

exports.default = requestImage