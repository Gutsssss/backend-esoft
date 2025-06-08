const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const basketController = require('../controllers/basketController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/auth',authMiddleware, userController.check)
router.get('/:id/basket', basketController.getOne)
router.post('/:id/add', userController.addToBasket)

module.exports = router