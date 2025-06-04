const Router = require('express')
const basketController = require('../controllers/basketController')
const router = Router()
router.get('/',basketController.getOne)

module.exports = router