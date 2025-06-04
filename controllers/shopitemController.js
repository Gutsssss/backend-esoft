const uuid = require('uuid')
const path = require('path')
const {ShopItem,ItemInfo} = require('../models/models')
const ApiError = require('../error/ApiError')
const { where } = require('sequelize')
const { title } = require('process')
class ShopItemController {
    async create (req,res,next) {
        try {
        const {name,price,brandId,typeId,info} = req.body
        const {img} =  req.files
        let filename = uuid.v4() + ".jpg"
        img.mv(path.resolve(__dirname,'..','static',filename))
        const item = await ShopItem.create({name,price,brandId,typeId,img:filename})
        if (info) {
            info = JSON.parse(info)
            info.forEach(async element => {
                await ItemInfo.create({
                    title:element.title,
                    description:element.description,
                    diviceId:item.id
                })
            });
        }
        
        return res.json(item)
        }
        catch (err) {
            return next(ApiError.badRequest(err.message))
        }
        
    }
    async delete (req,res,next) {
        try {
            const {id} = req.params
            const item = await ShopItem.destroy({where:{id}})
            if(!item) {
                next(ApiError.badRequest('Не удаллоись найти предмет'))
            }
            return res.json(item)
        }catch (err) {
            return next(ApiError.badRequest("Не удалось удалить"))
        }
    }
    async getAll(req, res) {
        let {brandId, typeId, limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        let where = {}
        if(brandId) where.brandId = brandId
        if(typeId) where.typeId = typeId
        const items = await ShopItem.findAndCountAll({
            where: Object.keys(where).length ? where : undefined,
            limit,
            offset,
        })
        return res.json(items)
    }
    async getOne(req, res) {
        const {id} = req.params
        const item = await ShopItem.findOne(
            {
                where: {id},
                include: [{model: ItemInfo, as: 'info'}]
            },
        )
        return res.json(item)
    }
}

module.exports = new ShopItemController()