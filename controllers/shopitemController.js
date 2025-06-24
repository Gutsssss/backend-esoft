const uuid = require("uuid");
const path = require("path");
const { ShopItem, ItemInfo } = require("../models/models");
const ApiError = require("../error/ApiError");
class ShopItemController {
  async create(req, res, next) {
    try {
      const { name, price, brandId, typeId, info } = req.body;
      const { img } = req.files || {};
      if(!img) {
        return next(ApiError.badRequest('Файл не указан'))
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
      include: [{ model: ItemInfo, as: 'info' }],
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
