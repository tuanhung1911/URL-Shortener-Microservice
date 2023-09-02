require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const url = require('url');
const validUrl = require('valid-url');

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log("ket noi thanh cong")
})
.catch(() => {
  console.error("ket noi that bai")
})

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

const Schema = mongoose.Schema
const noThing = new Schema({
  original_url: String,
  short_url: Number
})
const urls = mongoose.model('urls', noThing)

let url_1 = new urls({
  original_url: "https://youtobe.com",
  short_url: 1
})
let done = (err, data) => {
  if (err) return console.error(err)
  console.log(data)
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

function isValidUrl(testUrl) {
    return validUrl.isWebUri(testUrl);
}

app.post('/api/shorturl', (req, res) => {
  let testUrl = req.body.url
  if ( ! isValidUrl(testUrl)) {
    res.json({ error: 'invalid url' })
  } else {
  urls.findOne({original_url: testUrl})
      .then(url_found => {
        if (url_found) {
          done(null, url_found)
          res.json({ original_url : testUrl, short_url : url_found.short_url})
        } else {
          urls.find()
              .then((urlArr) => {
                console.log(urlArr.length)
                res.json({ original_url : testUrl, short_url : urlArr.length})
                const cur_url = new urls({
                  original_url: testUrl,
                  short_url: urlArr.length
                })
                cur_url.save()
                       .then((data) => {
                         console.log(data)
                       })
                       .catch((err) => {
                         console.error(err)
                       })
              })
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  urls.findOne({short_url: req.params.short_url})
      .then((find_url) => {
        if (find_url) {
          res.redirect(find_url.original_url)
        }
      })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
