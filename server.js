const fs = require('fs')
const { resolve } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const webPush = require('web-push')

require('./app/webpush')()

const app = express()
const PORT = process.env.PORT || 8080

const loadSubscription = () => {
  try {
    const data = fs.readFileSync(resolve(__dirname, 'sub.json'), 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return null
  }
}

let subscription = loadSubscription()

app.use(express.static(resolve(__dirname, 'client')))
app.use(bodyParser.json())

app.post('/subscription', (req, res, next) => {
  subscription = req.body
  fs.writeFile(resolve(__dirname, 'sub.json'), JSON.stringify(subscription), (err) => {
    if (err) return next(err)
    console.log('::GOT SUBSCRIPTION::', subscription)
    res.status(201).json(subscription)
  })
})

app.post('/broadcast', (req, res, next) => {
  console.log('::GOT BROADCAST::', req.body)
  const data = { title: 'Hey, this is a push notification!', ...req.body }
  webPush.sendNotification(subscription, JSON.stringify(data))
  res.status(201).json(data)
})

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})