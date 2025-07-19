const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Basket, ShopItem, BasketItem,BlackListedToken,Comment } = require("../models/models");
const sequelize = require('../db')
const generateJwt = (id, email, role) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { id, email, role },
    secret,
    { expiresIn: '24h' }
  );
};

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, role } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest("Некорректный email или password"));
    }
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(
        ApiError.badRequest("Пользователь с таким email уже существует")
      );
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ email, role, password: hashPassword });
    const basket = await Basket.create({ userId: user.id });
    const token = generateJwt(user.id, user.email, user.role);
    return res.json({ token });
    }catch (err) {
      next(ApiError.internal('Что то пошло не так'))
    }

    
  }
  async addToBasket(req, res, next) {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    
    const { id } = req.params;
    const { items } = req.body;
    if (!id || !items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return next(ApiError.badRequest("Не указаны ID пользователя или список товаров"));
    }
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return next(ApiError.notFound("Пользователь не найден"));
    }
    let basket = await Basket.findOne({ 
      where: { userId: id },
      transaction
    });
    
    if (!basket) {
      basket = await Basket.create({ userId: id }, { transaction });
    }
    const itemNames = items.map(item => item.name);
    const shopItems = await ShopItem.findAll({ 
      where: { name: itemNames },
      transaction
    });
    if (shopItems.length !== items.length) {
      const foundNames = shopItems.map(item => item.name);
      const notFoundItems = items.filter(item => !foundNames.includes(item.name));
      
      await transaction.rollback();
      return next(ApiError.notFound(
        `Следующие товары не найдены: ${notFoundItems.map(item => item.name).join(', ')}`
      ));
    }
    const existingItems = await BasketItem.findAll({
      where: {
        basketId: basket.id,
        shopItemId: shopItems.map(item => item.id)
      },
      transaction
    });

    if (existingItems.length > 0) {
      const existingItemIds = existingItems.map(item => item.shopItemId);
      const existingShopItems = shopItems.filter(item => existingItemIds.includes(item.id));
      
      await transaction.rollback();
      return next(ApiError.badRequest(
        `Следующие товары уже в корзине: ${existingShopItems.map(item => item.name).join(', ')}`
      ));
    }
    await BasketItem.bulkCreate(
      shopItems.map(shopItem => ({
        basketId: basket.id,
        shopItemId: shopItem.id,
        quantity: items.find(item => item.name === shopItem.name).quantity || 1
      })),
      { transaction }
    );
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Товары успешно добавлены в корзину",
      count: shopItems.length
    });

  } catch (err) {
    if (transaction) await transaction.rollback();
    
    console.error('Ошибка в addToBasket:', err);
    return next(ApiError.internal("Ошибка сервера при добавлении в корзину"));
  }
}
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.internal("Пользователь не найден"));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal("Указан неверный пароль"));
    }
    const token = generateJwt(user.id, user.email, user.role);
    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
        return next(ApiError.internal(err.message || "Что то пошло не так"));
  }
    }
  async logout(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(ApiError.badRequest('Токен не предоставлен'));
    }
    await BlackListedToken.create({ token, expiresAt: new Date(Date.now() + 1000 * 60 * 60) })
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Выход выполнен успешно' });
  } catch (err) {
    console.error('Ошибка при выходе:', err);
    return next(ApiError.internal('Произошла ошибка при выходе'));
  }
}
  async check(req, res, next) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
}
async createComment(req, res,next) {
    try {
        const { userId, itemId, text, rating } = req.body;
        
        // Проверяем, оставлял ли пользователь уже комментарий к этому товару
        const existingComment = await Comment.findOne({
            where: { userId, shopItemId: itemId }
        });
        
        if (existingComment) {
            return next(ApiError.badRequest('Вы уже оставляли комментарий'))
        }
        
        const comment = await Comment.create({
            text,
            rating,
            userId,
            shopItemId: itemId
        });
        
        res.status(201).json(comment);
    } catch (e) {
        next(ApiError.internal('Ошибка при создании'))
    }
}
}

module.exports = new UserController();
