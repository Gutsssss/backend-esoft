const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Basket, ShopItem, BasketItem,BlackListedToken } = require("../models/models");

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
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
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!id) {
        return next(ApiError.badRequest("Пользователь не найден"));
      }
      const user = await User.findOne({ 
        where: { id },
        include: [{
          model: Basket,
          include: [BasketItem]
        }]
      });

      if (!user) {
        return next(ApiError.badRequest("Пользователь не найден"));
      }
      let basket = user.Basket;
      if (!basket) {
        basket = await Basket.create({ userId: id });
      }
      const item = await ShopItem.findOne({ where: { name } });
      if (!item) {
        return next(ApiError.badRequest("Товар не найден"));
      }
      const existingItem = await BasketItem.findOne({
        where: {
          basketId: basket.id,
          shopItemId: item.id
        }
      });

      if (existingItem) {
        return next(ApiError.badRequest("Товар уже в корзине"));
      }
      await BasketItem.create({
        basketId: basket.id,
        shopItemId: item.id
      });
      const updatedUser = await User.findOne({
        where: { id },
        include: [{
          model: Basket,
          include: [{
            model: BasketItem,
            include: [ShopItem]
          }]
        }]
      });

      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return next(ApiError.internal("Что то пошло не так"));
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
    return next(ApiError.internal("Что то пошло не так"))
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
}

module.exports = new UserController();
