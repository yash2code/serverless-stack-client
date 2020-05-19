module.exports = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKey: process.env.TWILIO_API_KEY,
    apiSecret: process.env.TWILIO_API_SECRET,
    chatService: process.env.TWILIO_CHAT_SERVICE_SID,
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: process.env.TWILIO_ALLOW_INCOMING_CALLS === "true",
    authToken: process.env.TWILIO_AUTH_TOKEN
  },
  aws: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    bucketName: process.env.BUCKET_NAME,
    bucketNameTranscribe: process.env.BUCKET_NAME_TRANSCRIBE,
    bucketNameVideo: process.env.BUCKET_NAME_VIDEO
  }
};
