const Router = require('express')
const router = Router()
const brandController = require('../controllers/brandController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/',checkRoleMiddleware("ADMIN"),brandController.create)
router.get('/',brandController.getAll)

module.exports = router