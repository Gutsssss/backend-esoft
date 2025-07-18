const uuid = require("uuid");
const path = require("path");
const { ShopItem, ItemInfo,Comment,User } = require("../models/models");
const ApiError = require("../error/ApiError");
const { Op, json, where } = require("sequelize");
class ShopItemController {
  async create(req, res, next) {
    try {
      const { name, price, brandId, typeId, fullDescription } = req.body;
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
        fullDescription,
      });
      if (fullDescription) {
            await ItemInfo.create({
                fullDescription,
                shopItemId: item.id
            });
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
  async editProduct(req, res, next) {
  try {
    const { id, name, price, brandId, typeId, info } = req.body;
    const { img } = req.files || {};
    if (!name || !price || !brandId || !typeId) {
      return next(ApiError.badRequest('Не все обязательные поля указаны'));
    }
    const existingItem = await ShopItem.findByPk(id);
    if (!existingItem) {
      return next(ApiError.badRequest('Товар не найден'));
    }
     if (info && info[0]?.fullDescription) {
      const fullDescription = info[0].fullDescription;
      const itemInfo = await ItemInfo.findOne({ where: { shopItemId: id } });
      if (itemInfo) {
        await ItemInfo.update(
          fullDescription,
          { where: { id: itemInfo.id } }
        );
      } else {
        await ItemInfo.create({
          shopItemId: id,
          fullDescription
        });
      }
    }
    const updateData = {
      name,
      price,
      brandId,
      typeId,
      info
    };
    if (img) {
      const filename = uuid.v4() + ".jpg";
      await img.mv(path.resolve(__dirname, "..", "static", filename));
      updateData.img = filename;
      if (existingItem.img) {
        fs.unlinkSync(path.resolve(__dirname, "..", "static", existingItem.img));
      }
    }
    const [affectedCount] = await ShopItem.update(updateData, {
      where: { id },
      returning: true 
    });

    if (affectedCount === 0) {
      return next(ApiError.badRequest('Не удалось изменить товар'));
    }
    // const updatedItem = await ShopItem.findByPk(id);
    return res.json(updateData);

  } catch (err) {
    console.error('Ошибка при изменении продукта:', err);
    return next(ApiError.badRequest('Не удалось изменить продукт', err));
  }
}
  async getAll(req, res) {
    let { brandId, typeId } = req.query;
    let where = {};
    
    if (brandId) where.brandId = brandId;
    if (typeId) where.typeId = typeId;

    const items = await ShopItem.findAndCountAll({
      where: Object.keys(where).length ? where : undefined
    });

    return res.json({
      rows: items.rows,
      count: items.count
    });
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
 async getItemComments(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Некорректный ID товара. Ожидается число.'
            });
        }
        const item = await ShopItem.findOne({
            where: { id: Number(id) },
            include: [{
                model: Comment,
                as: 'comments',
                include: [{
                    model: User,
                    attributes: ['id', 'email']
                }],
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }

        return res.json({
            success: true,
            data: item.comments,
            count: item.comments.length
        });
        
    } catch (e) {
        console.error('Ошибка в getItemComments:', e);
        res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера при получении комментариев',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
}
}

module.exports = new ShopItemController();
