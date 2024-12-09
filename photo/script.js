var btn = document.querySelector('button')
btn.onclick = download//showImg

var vdo = document.querySelector('video');
var img

if (navigator.mediaDevices.getUserMedia) {       
  navigator.mediaDevices.getUserMedia({video: true})
  .then(function(stream) {
    vdo.srcObject = stream;
  })
  .catch(function(error) {
    console.log('Something went wrong!');
  });
}

function captureVideo(video) {
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var canvasContext = canvas.getContext('2d');
  canvasContext.drawImage(video, 0, 0);
  return canvas.toDataURL('image/png');
}

function showImg() {
  var src = captureVideo(vdo)
  vdo.setAttribute('hidden', '')
  if (!!img === false) {
    img = document.createElement('img')
  }
  else {
    img.removeAttribute('hidden')
  }
  img.src = src
  document.querySelector('video').prepend(img)

  btn.textContent = 'Download'
  btn.onclick = download
}

async function download() {
  var src = captureVideo(vdo)
  var a = document.createElement('a')
  a.style = 'width: 0; height: 0; display: none;'
  a.href = src;
  a.download = `Photo ${new Date()}.png`
  document.body.appendChild(a)
  a.click()
  window.parent.removeActive()
  location.href = '/upload'
}