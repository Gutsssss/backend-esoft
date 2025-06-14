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
const BasketItem = sequelize.define('basket_item',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
})

const ShopItem = sequelize.define('shop_item', {
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,unique:true,allowNull:false},
    price:{type:DataTypes.INTEGER,allowNull:false},
    rating:{type:DataTypes.STRING,defaultValue:0},
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
const Rating = sequelize.define('rating',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    rate:{type:DataTypes.INTEGER,allowNull:false}
})
const ItemInfo = sequelize.define('item_info',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    title:{type:DataTypes.STRING,allowNull:false},
    description:{type:DataTypes.TEXT}
})
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

User.hasOne(Basket)
Basket.belongsTo(User)

User.hasMany(Rating)
Rating.belongsTo(User)

Basket.hasMany(BasketItem)
BasketItem.belongsTo(Basket)

Type.hasMany(ShopItem)
ShopItem.belongsTo(Type)

Brand.hasMany(ShopItem)
ShopItem.belongsTo(Brand)

ShopItem.hasMany(Rating)
Rating.belongsTo(ShopItem)

ShopItem.hasMany(BasketItem)
BasketItem.belongsTo(ShopItem)

ShopItem.hasMany(ItemInfo, {as: 'info'})
ItemInfo.belongsTo(ShopItem)

Type.belongsToMany(Brand,{through:TypeBrand})
Brand.belongsToMany(Type,{through:TypeBrand})


module.exports  = {
    User,
    Basket,
    BasketItem,
    ShopItem,
    Type,
    Brand,
    Rating,
    ItemInfo,
    TypeBrand,
    BlackListedToken
}
