const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Basket, ShopItem, BasketItem } = require("../models/models");

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class UserController {
  async registration(req, res, next) {
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
  }
  async addToBasket(req, res, next) {
    try {
      const { id } = req.params; // User ID
      const { name } = req.body; // Product name

      if (!id) {
        return next(ApiError.badRequest("Пользователь не найден"));
      }

      // Find the user and their basket
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

      // Find or create the user's basket
      let basket = user.Basket;
      if (!basket) {
        basket = await Basket.create({ userId: id });
      }

      // Find the shop item
      const item = await ShopItem.findOne({ where: { name } });
      if (!item) {
        return next(ApiError.badRequest("Товар не найден"));
      }

      // Check if item already exists in basket
      const existingItem = await BasketItem.findOne({
        where: {
          basketId: basket.id,
          shopItemId: item.id
        }
      });

      if (existingItem) {
        // If item exists, you might want to increment quantity or return error
        return next(ApiError.badRequest("Товар уже в корзине"));
      }

      // Add item to basket
      await BasketItem.create({
        basketId: basket.id,
        shopItemId: item.id
        // You can add quantity or other fields here if needed
      });

      // Return updated user with basket and items
      const updatedUser = await User.findOne({
        where: { id },
        include: [{
          model: Basket,
          include: [{
            model: BasketItem,
            include: [ShopItem] // Include the shop item details
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
  }

  async check(req, res, next) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
  }
}

module.exports = new UserController();
