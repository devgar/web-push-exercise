const webpush = require('web-push')

const publicVapidKey = process.env.VAPID_PUBLIC_KEY
const privateVapidKey = process.env.VAPID_PRIVATE_KEY

module.exports = () => {
  webpush.setVapidDetails(
    'mailto:dev.gardo@gmail.com',
    publicVapidKey,
    privateVapidKey
  )
}