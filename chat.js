// var script = document.createElement('script'); script.src="//cdn.jsdelivr.net/npm/eruda"; document.body.appendChild(script); script.onload = function () { eruda.init() };

var imagesInChat = false
var p = `Genatate a detailed desctiption of the provided images with as much detail as you can!`

window.addEventListener("DOMContentLoaded", function (e) {
  chatElement.value = p
  chatElement.disabled = 'true'
});
  
function specialActs4Conv(role, content, moreParams) {
  if (role === 'ai') {
    setTimeout(function() {
      if (content.startsWith('The image is a')) {
        content = `Create a ${content.substring('The image is a'.length)}`
      }
      content = encodeURIComponent(content)

      if (imagesInChat) {
        var content4Img = content
        if (content4Img.includes(' \n ')) {
          content4Img = content4Img.split(' \n ').join('\n')
        }
        if (content4Img.includes(' \n')) {
          content4Img = content4Img.split(' \n').join('\n')
        }
        if (content4Img.includes('\n ')) {
          content4Img = content4Img.split('\n ').join('\n')
        }
        sendMessage(content4Img, 'create-image', true)
      }
      else {
        var createUrl = `/create?prompt=${content}`
        if (!!filelocation) createUrl += `&fl=${filelocation}`
        createUrl += `&urls=${urls}`
        location.href = createUrl
      }
    }, 1000)
  }
  if (role === 'box') {
    if (!!moreParams) {
      if (!!moreParams.name) {
        if (moreParams.name === 'welcome') {
          sendMessage()
        }
      }
    }
  }
}