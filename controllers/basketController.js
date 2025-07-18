const { Basket, BasketItem, User, ShopItem, Type, Brand, ItemInfo } = require("../models/models");
const ApiError = require("../error/ApiError");

class BasketController {
  async getOne(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) return next(ApiError.badRequest("Не указан ID пользователя"));

    const user = await User.findByPk(id);
    if (!user) return next(ApiError.notFound("Пользователь не найден"));

    const basket = await Basket.findOne({
      where: { userId: id },
      include: [{
        model: BasketItem,
        as: 'basket_items',
        include: [{
          model: ShopItem,
          include: [
            { model: Type },
            { model: Brand },
            { model: ItemInfo, as: 'info' }
          ]
        }]
      }]
    });

    if (!basket) return res.status(200).json({ success: true, items: [], totalItems: 0, totalPrice: 0 });

    const totalPrice = basket.basket_items.reduce((sum, item) => {
      return item.ShopItem ? sum + (item.ShopItem.price * item.quantity) : sum;
    }, 0);

    return res.status(200).json({
      success: true,
      items: basket.basket_items,
      totalItems: basket.basket_items.length,
      totalPrice
    });

  } catch (err) {
    console.error('Ошибка в getBasket:', err);
    return next(ApiError.internal("Ошибка сервера при получении корзины"));
  }
}
async removeFromBasket(req, res, next) {
  try {
    const { userId, itemId } = req.params;
    if (!userId || !itemId) {
      return next(ApiError.badRequest("Не указаны ID пользователя или товара"));
    }
    const basket = await Basket.findOne({ 
      where: { userId },
      include: [{
        model: BasketItem,
        as: 'basket_items'
      }]
    });

    if (!basket) {
      return next(ApiError.notFound("Корзина не найдена"));
    }
    const basketItem = await BasketItem.findOne({
      where: {
        id: itemId,
        basketId: basket.id
      }
    });

    if (!basketItem) {
      return next(ApiError.notFound("Товар не найден в корзине"));
    }
    await basketItem.destroy();
    const updatedBasket = await Basket.findOne({
      where: { userId },
      include: [{
        model: BasketItem,
        as: 'basket_items',
        include: [{
          model: ShopItem,
          include: [
            { model: Type },
            { model: Brand },
            { model: ItemInfo, as: 'info' }
          ]
        }]
      }]
    });
    const items = updatedBasket?.basket_items || [];

    return res.status(200).json({
      success: true,
      message: "Товар успешно удален из корзины",
      items,
      totalItems: items.length,
    });

  } catch (err) {
    console.error('Ошибка в removeFromBasket:', err);
    return next(ApiError.internal("Ошибка сервера при удалении из корзины"));
  }
}
}

module.exports = new BasketController();