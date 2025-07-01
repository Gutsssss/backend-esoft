const uuid = require("uuid");
const path = require("path");
const { ShopItem, ItemInfo } = require("../models/models");
const ApiError = require("../error/ApiError");
const { Op, json } = require("sequelize");
class ShopItemController {
  async create(req, res, next) {
    try {
      const { name, price, brandId, typeId, info } = req.body;
      const { img } = req.files || {};
      if (!img) {
        return next(ApiError.badRequest("Файл не указан"));
      }
      let filename = uuid.v4() + ".jpg";
      await img.mv(path.resolve(__dirname, "..", "static", filename));
      const item = await ShopItem.create({
        name,
        price,
        brandId,
        typeId,
        img: filename,
        info,
      });
      if (info) {
        let parsedInfo = JSON.parse(info);

        const itemsInfos = parsedInfo.map((elem) => ({
          title: elem.title,
          description: elem.description,
          deviceId: item.id,
        }));
        await ItemInfo.bulkCreate(itemsInfos);
      }
      return res.json(item);
    } catch (err) {
      return next(ApiError.badRequest(err.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const item = await ShopItem.destroy({ where: { id } });
      if (!item) {
        next(ApiError.badRequest("Не удаллоись найти предмет"));
      }
      return res.json(item);
    } catch (err) {
      return next(ApiError.badRequest("Не удалось удалить"));
    }
  }
  async searchItems(req, res, next) {
    try {
      const { name } = req.params;

      // Проверка на пустой запрос
      if (!name || name.trim() === "") {
        return res.status(200).json([]);
      }

      const items = await ShopItem.findAll({
        where: {
          name: {
            [Op.iLike]: `%${name}%`,
          },
        },
        include: [{ model: ItemInfo, as: "info" }],
      });

      return res.json(items);
    } catch (err) {
      console.error("Ошибка поиска:", err);
      return next(ApiError.internal("Произошла ошибка при поиске товаров"));
    }
  }
  async editProduct(req,res,next) {
    try {
      const {  id, name, price, brandId, typeId, info, img } = req.body;
      if(!id || !name || !price || !brandId || !typeId) {
        return next(ApiError.badRequest('Не все обязательные поля указаны'))
      }
      const existingItem = await ShopItem.findByPk(id)
      if(!existingItem) {
        return next(ApiError.badRequest('Товар не найден'))
      }
      const [affectedCoun,[updatedItem]] = await ShopItem.update(
        {id, name, price, brandId, typeId, info, img},
        {
          where:{id},
        }
      )
      if(affectedCoun) {
        return next(ApiError.badRequest('Не удалось изменить товар'))
      }
        return res.json(updatedItem)
    }
    catch(err) {
      return next(ApiError.badRequest('Не удалось изменить продукт',err))
    }
  }
  async getAll(req, res) {
    let { brandId, typeId, limit, page } = req.query;
    page = page || 1;
    limit = limit || 9;
    let offset = page * limit - limit;
    let where = {};
    if (brandId) where.brandId = brandId;
    if (typeId) where.typeId = typeId;
    const items = await ShopItem.findAndCountAll({
      where: Object.keys(where).length ? where : undefined,
      limit,
      offset,
    });
    return res.json(items);
  }
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const item = await ShopItem.findOne({
        where: { id },
        include: [{ model: ItemInfo, as: "info" }],
      });

      if (!item) {
        return next(ApiError.badRequest("Товар не найден"));
      }

      return res.json(item);
    } catch (err) {
      return next(ApiError.internal(err));
    }
  }
}

module.exports = new ShopItemController();
