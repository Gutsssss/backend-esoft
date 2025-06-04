const {Basket,User} = require('../models/models')
const ApiError = require('../error/ApiError')
class BasketController {
    async getOne(req, res,next) {
        try {
            const {id} = req.params
        const candidtate = await User.findAll({
                where: {id},
                include: [{model: Basket}]
            },)
        if(!candidtate) {
            return next(ApiError.badRequest('Пользователь не найден'))
        }
        return res.json(candidtate)
        } catch(err) {
            return next(ApiError.internal('Что то пошло не так'))
        }
        }
        
        
    }
module.exports = new BasketController()