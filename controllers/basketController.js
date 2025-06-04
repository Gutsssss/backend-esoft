const {Basket,User} = require('../models/models')
const ApiError = require('../error/ApiError')
class BasketController {
    async getOne(req, res) {
        const {id} = req.params
        const candidtate = User.findAll({where:{id}})
        if(!candidtate) {
            return req.json(ApiError.badRequest('Пользователь не найден'))
        }
        else {
            const item = await User.findOne(
            {
                where: {id},
                include: [{model: Basket}]
            },
        )
        return res.json(item)
        }
        
    }
}

module.exports = new BasketController()