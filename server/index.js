const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
const pino = require('express-pino-logger')()
const { chatToken, videoToken, voiceToken } = require('./tokens')
const Twilio = require('twilio')
var ffmpeg = require('fluent-ffmpeg')
const app = express()
const AWS = require('aws-sdk')
const fs = require('fs')
const axios = require('axios')

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
  // .then(media_path => {
  //   let path = media_path.split('.')
  //   if(path.includes('mkv')){
  //     await ffmpeg(`${recordingSid}.mka`)
  //         .addInput(`${recordingSid}.mp3`)
  //         .on('start', function (commandLine) {
  //           console.log('Spawned Ffmpeg with command: ' + commandLine)
  //         })
  //         .on('progress', function (progress) {
  //           console.log('Processing: ' + progress.percent + '% done')
  //         })
  //         .toFormat('mp4')
  //         .on('end', function () {
  //           console.log('Processing finished !')
  //           var params = {
  //             Body: fs.createReadStream(`${recordingSid}.mp4`),
  //             Bucket: config.aws.bucketNameVideo,
  //             Key: `${recordingSid}.mp4`,
  //           }
  //           s3.upload(params, function (err, data) {
  //             //handle error
  //             if (err) {
  //               console.log('Error', err)
  //             }

  //             //success
  //             if (data) {
  //               console.log('Uploaded in:', data.Location)
  //             }
  //           })
  //         })
  //         .on('error', function (err) {
  //           console.log('An error occurred: ' + err.message)
  //         })
  //         .save(`${recordingSid}.mp4`)
  //   }
  // })

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

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
)
