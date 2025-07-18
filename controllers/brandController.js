const {Brand} = require('../models/models')
const ApiError = require('../error/ApiError')
class BrandController {
    async create (req,res,next) {
        try {
        const {name} = req.body
        const checkBrand = await Brand.findOne({where:{name}})
        if(checkBrand) {
            return next(ApiError.badRequest("Бренд с таким именем уже существует"))
        }
        const brand = await Brand.create({name})
        return res.json(brand)
        }catch(err) {
            next(ApiError.badRequest('Ошибка',err))
        }
        
    }
    async getAll (req,res) {
        const brands = await Brand.findAll()
        return res.json(brands)
    }
}

module.exports = new BrandController()