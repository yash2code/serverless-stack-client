const obj = {
  NODE_ENV: 'production',
  TWILIO_ACCOUNT_SID: 'AC6230a32d2b48f3a5aec55621b5aec1ed',
  TWILIO_API_KEY: 'SK23ee53691ca69eb349b243148622ec8d',
  TWILIO_API_SECRET: 'ETJHgAnfMtiRN8N97whdASjA7S2uosYJ',
  TWILIO_AUTH_TOKEN: '2017501541e5c4046a1a3fe5e244bdf3',
  ACCESS_KEY_ID: 'AKIAUB4RWWTD6NPGEU5R',
  SECRET_ACCESS_KEY: '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',
  BUCKET_NAME: 'weadmit-bucket',
  BUCKET_NAME_TRANSCRIBE: 'weadmit-transcribe-bucket',
  BUCKET_NAME_VIDEO: 'weadmit-video-bucket',
}

module.exports = {
  twilio: {
    accountSid: obj.TWILIO_ACCOUNT_SID,
    apiKey: obj.TWILIO_API_KEY,
    apiSecret: obj.TWILIO_API_SECRET,
    chatService: obj.TWILIO_CHAT_SERVICE_SID,
    outgoingApplicationSid: obj.TWILIO_TWIML_APP_SID,
    incomingAllow: obj.TWILIO_ALLOW_INCOMING_CALLS === 'true',
    authToken: obj.TWILIO_AUTH_TOKEN,
  },
  aws: {
    accessKeyId: obj.ACCESS_KEY_ID,
    secretAccessKey: obj.SECRET_ACCESS_KEY,
    bucketName: obj.BUCKET_NAME,
    bucketNameTranscribe: obj.BUCKET_NAME_TRANSCRIBE,
    bucketNameVideo: obj.BUCKET_NAME_VIDEO,
  },
}
