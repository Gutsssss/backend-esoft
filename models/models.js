const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    email:{type:DataTypes.STRING,unique:true},
    password:{type:DataTypes.STRING},
    role:{type:DataTypes.STRING,defaultValue:'USER'}
})
const Basket = sequelize.define('basket',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
})
const BasketItem = sequelize.define('basket_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
}, {
    tableName: 'basket_items'
})

const ShopItem = sequelize.define('shop_item', {
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,unique:true,allowNull:false},
    price:{type:DataTypes.INTEGER,allowNull:false},
    rating:{type:DataTypes.FLOAT,defaultValue:0},
    img:{type:DataTypes.STRING,allowNull:false},
})
const Type = sequelize.define('type',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,unique:true,allowNull:false}
})
const Brand = sequelize.define('brand',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,unique:true,allowNull:false}
})
// const Rating = sequelize.define('rating',{
//     id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
//     rate:{type:DataTypes.INTEGER,allowNull:false}
// })
const ItemInfo = sequelize.define('item_info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});
const BlackListedToken = sequelize.define('BlackListedToken',{
    token:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    expiresAt:{
        type:DataTypes.DATE,
        allowNull:false
    }
})

const TypeBrand = sequelize.define('type_brand',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true}
})

const Comment = sequelize.define('comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    rating: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: true,
    updatedAt: false
});

User.hasMany(Comment);
Comment.belongsTo(User);

User.hasOne(Basket)
Basket.belongsTo(User)

// User.hasMany(Rating)
// Rating.belongsTo(User)

Basket.hasMany(BasketItem, { as: 'basket_items' });
BasketItem.belongsTo(Basket);

Type.hasMany(ShopItem)
ShopItem.belongsTo(Type)

Brand.hasMany(ShopItem)
ShopItem.belongsTo(Brand)

ShopItem.hasMany(Comment, { as: 'comments' });
Comment.belongsTo(ShopItem);

ShopItem.hasMany(BasketItem)
BasketItem.belongsTo(ShopItem)

ShopItem.hasMany(ItemInfo, {as: 'info'})
ItemInfo.belongsTo(ShopItem)

Type.belongsToMany(Brand,{through:TypeBrand})
Brand.belongsToMany(Type,{through:TypeBrand})


ShopItem.addHook('afterSave', async (item, options) => {
    const comments = await item.getComments();
    if (comments.length > 0) {
        const avgRating = comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length;
        await item.update({ rating: avgRating.toFixed(1) }, { transaction: options.transaction });
    }
});

module.exports  = {
    User,
    Basket,
    BasketItem,
    ShopItem,
    Type,
    Brand,
    ItemInfo,
    TypeBrand,
    BlackListedToken,
    Comment
}
