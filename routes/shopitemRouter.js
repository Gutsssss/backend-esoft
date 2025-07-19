const Router = require('express')
const router = Router()
const shopItemController = require('../controllers/shopitemController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/',checkRoleMiddleware("ADMIN"),shopItemController.create)
router.get('/',shopItemController.getAll)
router.get('/:id',shopItemController.getOne)
router.delete('/:id',checkRoleMiddleware("ADMIN"),shopItemController.delete)
router.get('/:id/comments',shopItemController.getItemComments)

module.exports = router