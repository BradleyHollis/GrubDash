const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res){
    res.json({ data: dishes });
};

function dishExists(req, res, next){
    const { dishId } = req.params; 
    const foundDish = dishes.find(({ id }) => id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }

    next({
        status: 404, 
        message: `Dish id not found: ${dishId}`
    })
}

function read(req, res){
    res.json({ data: res.locals.dish });
}

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] && data[propertyName] !== "") {
        return next();
      }
      next({
          status: 400,
          message: `Must include a ${propertyName}`
      });
    };
}

function pricePropertyIsValid(req, res, next){
    const { data: { price } = {} } = req.body;
    if(price > 0){
        return next();
    } 
    next({
        status: 400, 
        message: `Value of 'price' property must be greater than 0`
    })
}

function create(req, res){
    const { data: { name, description, price, image_url } ={} } = req.body;
    const newDish = {
        id: nextId(), 
        name, 
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        pricePropertyIsValid,
        bodyDataHas("image_url"),
        create        
    ],
    read: [dishExists, read],
    list,
}