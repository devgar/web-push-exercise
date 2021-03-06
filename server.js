const fs = require('fs')
const { resolve } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const webPush = require('web-push')

require('./app/webpush')()

const app = express()
const PORT = process.env.PORT || 8080

const loadSubscriptions = () => {
  try {
    const data = fs.readFileSync(resolve(__dirname, 'subs.json'), 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

let subscriptions = loadSubscriptions()

app.get('/index.js', (req, res, next) => {
  fs.readFile(resolve(__dirname, 'client', 'index.js'), 'utf-8', (err, data) => {
    if (err) return next(err)
    data = data.replace('PUBLIC_VAPID_KEY', process.env.VAPID_PUBLIC_KEY)
    res.contentType('javascript').send(data)
  })
})
app.use(express.static(resolve(__dirname, 'client')))
app.use(bodyParser.json())

app.post('/subscription', (req, res, next) => {
  subscriptions = [...subscriptions, req.body]
  fs.writeFile(resolve(__dirname, 'subs.json'), JSON.stringify(subscriptions), (err) => {
    if (err) return next(err)
    console.log('::GOT SUBSCRIPTION::', req.body)
    res.status(201).json(subscriptions.length)
  })
})

app.post('/broadcast', (req, res, next) => {
  console.log('::GOT BROADCAST::', req.body)
  const data = { title: 'Hey, this is a push notification!', ...req.body }
  subscriptions.forEach(subscription => {
    console.log('PUSHING NOTIFICATION')
    webPush.sendNotification(subscription, JSON.stringify(data))
  })
  res.status(201).json(data)
})

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
