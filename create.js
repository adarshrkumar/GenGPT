window.addEventListener('DOMContentLoaded', function (e) {
  p = urlParams.get('prompt')
  chatElement.disabled = 'true'
  sendMessages(p, imagesAmt, 'starting', u, fl)
});