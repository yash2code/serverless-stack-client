/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const config = require('./config')
const pino = require('express-pino-logger')()
const { chatToken, videoToken, voiceToken } = require('./tokens')
const Twilio = require('twilio')
var ffmpeg = require('fluent-ffmpeg')
const AWS = require('aws-sdk')
const fs = require('fs')
const axios = require('axios')
// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


/**********************
 * Example get method *
 **********************/

const download_media = (url, media_path) =>
axios({
  url,
  responseType: 'stream',
}).then(
  (response) =>
    new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(media_path))
        .on('finish', () => resolve())
        .on('error', (e) => reject(e))
    })
)

AWS.config.update({
accessKeyId: config.aws.accessKeyId,
secretAccessKey: config.aws.secretAccessKey,
region: 'ap-south-1',
})

var s3 = new AWS.S3()
var transcribeservice = new AWS.TranscribeService({ region: 'ap-south-1' })

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(pino)

const client = new Twilio(config.twilio.apiKey, config.twilio.apiSecret, {
accountSid: config.twilio.accountSid,
})

let media = []

app.post('/api/statuscallback', (req, res) => {
res.setHeader('Content-Type', 'application/x-www-urlencoded')
console.log(req.body.RecordingSid, 'req in callback', req.body)
const statusCallbackEvent = req.body.StatusCallbackEvent
console.log(req.body)
if (statusCallbackEvent == 'recording-completed') {
  const container = req.body.Container
  const recordingSid = req.body.RecordingSid
  const uri = `https://video.twilio.com/v1/Recordings/${recordingSid}/Media`
  client.request({ method: 'GET', uri: uri }).then(async (response) => {
    const mediaLocation = response.body.redirect_to

    await download_media(mediaLocation, `${recordingSid}.${container}`)

    media.push(`${recordingSid}.${container}`)
    console.log(media, 'media')
    if (container == 'mka') {
      await new ffmpeg(fs.createReadStream(`${recordingSid}.mka`))
        .toFormat('mp3')
        .on('progress', function (progress) {
          console.log('Processing: ' + progress.percent + '% done')
        })
        .on('end', function () {
          console.log('Processing finished !')
          var params = {
            Body: fs.createReadStream(`${recordingSid}.mp3`),
            Bucket: config.aws.bucketName,
            Key: `${recordingSid}.mp3`,
          }
          s3.upload(params, function (err, data) {
            //handle error
            if (err) {
              console.log('Error', err)
            }

            //success
            if (data) {
              console.log('Uploaded in:', data.Location)
              var params = {
                LanguageCode: 'en-US',
                Media: {
                  MediaFileUri: data.Location,
                },
                OutputBucketName: config.aws.bucketNameTranscribe,
                TranscriptionJobName: `${recordingSid}`,
              }
              transcribeservice.startTranscriptionJob(params, function (
                err,
                data
              ) {
                if (err) console.log(err, err.stack)
                // an error occurred
                else console.log(data) // successful response
              })
            }
          })
        })
        .save(`${recordingSid}.mp3`)
    }
    if (media.length > 1) {
      await ffmpeg(media[1])
        .addInput(media[0])
        .on('start', function (commandLine) {
          console.log('Spawned Ffmpeg with command: ' + commandLine)
        })
        .on('progress', function (progress) {
          console.log('Processing: ' + progress.percent + '% done')
        })
        .toFormat('mp4')
        .on('end', function () {
          console.log('Processing finished !')
          var params = {
            Body: fs.createReadStream(`${recordingSid}.mp4`),
            Bucket: config.aws.bucketNameVideo,
            Key: `${recordingSid}.mp4`,
          }
          s3.upload(params, function (err, data) {
            //handle error
            if (err) {
              console.log('Error', err)
            }

            //success
            if (data) {
              console.log('Uploaded in:', data.Location)
            }
          })
        })
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message)
        })
        .save(`${recordingSid}.mp4`)
    }
  })
}
res.send('hello callback')
})

app.get('/api/getmedia/:sid', (req, res) => {
const ParticipantSid = req.params.sid
client.video.recordings
  .list({ groupingSid: [ParticipantSid], limit: 2 })
  .then((recordings) => recordings.forEach((r) => console.log(r.sid)))
})

const sendTokenResponse = (token, res) => {
res.set('Content-Type', 'application/json')
res.send(
  JSON.stringify({
    token: token.toJwt(),
  })
)
}

app.get('/api/greeting', (req, res) => {
const name = req.query.name || 'World'
res.setHeader('Content-Type', 'application/json')
res.send(JSON.stringify({ greeting: `Hello ${name}!` }))
})

app.get('/chat/token', (req, res) => {
const identity = req.query.identity
const token = chatToken(identity, config)
sendTokenResponse(token, res)
})

app.post('/chat/token', (req, res) => {
const identity = req.body.identity
const token = chatToken(identity, config)
sendTokenResponse(token, res)
})

app.get('/video/token', (req, res) => {
const identity = req.query.identity
const room = req.query.room
const token = videoToken(identity, room, config)
sendTokenResponse(token, res)
})

app.post('/video/token', (req, res) => {
const identity = req.body.identity
const room = req.body.room
const token = videoToken(identity, room, config)
sendTokenResponse(token, res)
})

app.get('/voice/token', (req, res) => {
const identity = req.body.identity
const token = voiceToken(identity, config)
sendTokenResponse(token, res)
})

app.post('/voice/token', (req, res) => {
const identity = req.body.identity
const token = voiceToken(identity, config)
sendTokenResponse(token, res)
})

app.get('/weadmit', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/weadmit/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/weadmit', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/weadmit/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/weadmit', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/weadmit/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/weadmit', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/weadmit/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
