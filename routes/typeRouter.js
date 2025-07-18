const Router = require('express')
const router = Router()
const typeController = require('../controllers/typeController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/type', checkRoleMiddleware('ADMIN'), typeController.create)
router.get('/type', typeController.getAll)
module.exports = router