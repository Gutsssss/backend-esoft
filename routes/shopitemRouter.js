const Router = require('express')
const router = Router()
const shopItemController = require('../controllers/shopitemController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/',checkRoleMiddleware("ADMIN"),shopItemController.create)
router.get('/',shopItemController.getAll)
router.get('/:id',shopItemController.getOne)
router.delete('/:id',checkRoleMiddleware("ADMIN"),shopItemController.delete)

module.exports = router