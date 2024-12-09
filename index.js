var fName = ''

var express =  require('express')
var app = express()
  
const request = require('request'); 
const fs = require('fs');
const path = require('path')
const multer = require('multer')

var calcNeedImgSize = require('./calcNeedImgSize').default
var newRequest = require('./request').default
var uploadImageFromWeb = require('./uploadImageFromWeb').default

// var upload = multer({ dest: 'Upload_folder_name' })
// If you do not want to use diskStorage then uncomment it

var storage = multer.diskStorage({
  destination: function (req, file, callback) {

    // Uploads is the Upload_folder_name
    callback(null, 'temp')
  },
  filename: function (req, file, callback) {
    fName = file.originalname
    callback(null, file.originalname)
  }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1000 * 1000 * 1000;

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, callback) {

    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png|webp|gif/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = path.extname(file.originalname).toLowerCase()
    extname = filetypes.test(extname);

    if (mimetype && extname) {
      fName = file.originalname
      return callback(null, fName);
    }

    callback('Error: File upload only supports the following filetypes - ' + filetypes, null);
  }
  // mypic is the name of file attribute
}).single('image');

// User inputs
app.get('/', function(req, res) {
  res.redirect('/upload')
})

app.get('/sendRequest', function(req, res) {
  var prompt = req.query.p
  var type = req.query.t
  var urls = req.query.urls
  var fl = req.query.fl
  var startingMessage = req.query.startingmessage
  if (!!urls) {
    if (urls.includes(',')) urls = urls.split(',')
    else urls = [urls]
  }
  else urls = false
  var model = 'turbo-preview';
  var size = ''
  switch (type) {
    case 'create-image': 
      model = '3'
      if (!!urls) {
        let url = urls[0]
        var path = url
        if (fl === 'temp-storage') {
          path = path.split('?')[1].split('name=')[1]
          if (path.includes('&')) path = path.split('&')[0]
        }
        else {
          path = uploadImageFromWeb(url)
        }
        size = calcNeedImgSize(`/temp/${path}`).size
      }
      break
    case 'image':
      model = 'vision-preview'
      break
  }
  newRequest(res, prompt, model, type, urls, null, size, null, startingMessage)
  //         res, prompt, model, type, urls, voice, systemId, startingMessage
})

app.post('/uploadFile', function (req, res) {
  // Error MiddleWare for multer file upload, so if any
  // error occurs, the image would not be uploaded!
  upload(req, res, function(err) {
    if(err) {
      // ERROR occurred (here it can be occurred due
      // to uploading image of size greater than
      // 1MB or uploading different file type)
      res.send(err)
    }
    else {
      // SUCCESS, image successfully uploaded
      // res.send(fName)
      var url = `/chat?filelocation=temp-storage&name=${fName}`
      var p = req.query.p
      if (!!p) url = `${url}&prompt=${p}`
      res.redirect(url)
    }
  })
})

app.get('/temp*', function(req, res) {
  var name = req.query.name
  var file = '/temp.html'
  if (!!name) {
    file = `/temp/${name}`
  }
  res.sendFile(__dirname + file)
})

app.get('/viewImage', function(req, res) {
  var url = req.query.u
  if (!!atob(url)) url = atob(url)
  var p = req.query.p
  var viewImage = fs.readFileSync('viewImage.html', 'utf8')
  viewImage = viewImage.split('$[src]').join(url)
  viewImage = viewImage.split('$[prompt]').join(p)

  res.send(viewImage)
})

app.get('/clearImages', function(req, res) {
  const directory = `${__dirname}/temp`;

  fs.readdir(directory, (err, files) => {
    if (err) res.send(err);

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) res.send(err);
      });
    }
    res.send('cleared!')
  });


})

app.get('/listImages', function(req, res) {
  var files = fs.readdirSync('temp')
  res.send(files)
})

app.get('*', function(req, res) {
  var path = req.path
  if (!path.includes('.')) path = `${path}.html`
  res.sendFile(__dirname + path)
})

app.listen(8080)