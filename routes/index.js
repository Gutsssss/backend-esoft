const express = require('express');
const router = express.Router();
const brandRouter = require('./brandRouter');
const shopitemRouter = require('./shopitemRouter');
const typeRouter = require('./typeRouter');
const userRouter = require('./userRouter');
const basketRouter = require('./basketRouter')

// Подключаем роуты
router.use('/user', userRouter);
router.use('/type', typeRouter);
router.use('/shopitem', shopitemRouter);
router.use('/brand', brandRouter);
router.use('/basket', basketRouter);

// Экспортируем только router (без объекта)
module.exports = router;