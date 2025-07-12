const Router = require('express')
const basketController = require('../controllers/basketController')
const authMiddleware = require('../middleware/authMiddleware')
const router = Router()
router.get('/:id', authMiddleware, basketController.getOne)
router.delete('/:userId/basket/:itemId', authMiddleware, basketController.removeFromBasket);

module.exports = router