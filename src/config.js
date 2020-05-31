export default {
  s3: {
    REGION: 'ap-south-1',
    BUCKET: 'weadmit-bucket',
  },
  apiGateway: {
    REGION: 'us-east-1',
    URL: 'https://6hjz319ihf.execute-api.us-east-1.amazonaws.com/prod',
  },
  cognito: {
    REGION: 'ap-south-1',
    USER_POOL_ID: 'ap-south-1_0TmZjaiN2',
    APP_CLIENT_ID: '2lkbt2qsja8j9semhpvns01n3p',
    IDENTITY_POOL_ID: 'ap-south-1:bfb1d449-8033-4d63-af5c-136d2c4a0e92',
  },
  MAX_ATTACHMENT_SIZE: 5000000,
}
