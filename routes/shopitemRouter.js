const Router = require('express')
const router = Router()
const shopItemController = require('../controllers/shopitemController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/shopitem', checkRoleMiddleware("ADMIN"), shopItemController.create)
router.get('/shopitem', shopItemController.getAll)
router.post('/shopitem/edit', checkRoleMiddleware('ADMIN'), shopItemController.editProduct)
router.get('/shopitem/search/:name', shopItemController.searchItems)
router.get('/shopitem/:id', shopItemController.getOne)
router.get('/:id/comments', shopItemController.getItemComments)
router.delete('/shopitem/:id', checkRoleMiddleware("ADMIN"), shopItemController.delete)

module.exports = router