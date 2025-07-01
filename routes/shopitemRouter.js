const Router = require('express')
const router = Router()
const shopItemController = require('../controllers/shopitemController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/',checkRoleMiddleware("ADMIN"),shopItemController.create)
router.get('/',shopItemController.getAll)
router.post('/edit',checkRoleMiddleware('ADMIN'),shopItemController.editProduct)
router.get('/search/:name', shopItemController.searchItems);
router.get('/:id',shopItemController.getOne)
router.delete('/:id',checkRoleMiddleware("ADMIN"),shopItemController.delete)

module.exports = router