const Router = require('express')
const router = Router()
const brandController = require('../controllers/brandController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/brand', checkRoleMiddleware("ADMIN"), brandController.create)
router.get('/brand', brandController.getAll)

module.exports = router