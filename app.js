const express = require('express')
require('dotenv').config()
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const fileUpload = require('express-fileupload')
const path = require('path')

const PORT = process.env.PORT || 3000
const app = express()
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json())
app.use(express.static(path.resolve(__dirname,'static')))
app.use(fileUpload({}))
app.use('/api',router)
//Обработка ошибок
app.use(errorHandler)
const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    
    app.listen(PORT, '0.0.0.0', () => {  // Явно указываем хост
      console.log(`Server STARTED on http://0.0.0.0:${PORT}`) // Измененное сообщение
    }).on('error', err => {
      console.error('SERVER ERROR:', err) // Логируем ошибки запуска
    })
    
  } catch(e) {
    console.error('DATABASE ERROR:', e)
  }
}

start()