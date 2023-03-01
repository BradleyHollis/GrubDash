const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res){
    res.json({ data: orders });
}

function orderExists(req, res, next){
    const { orderId } = req.params; 
    const foundOrder = orders.find(({ id }) => id == orderId );
    
    if(foundOrder){
        res.locals.order = foundOrder; 
        return next();
    }

    next({
        status: 404, 
        message: `Order id not found: ${orderId}`
    })
}

function read(req, res){
    res.json({ data: res.locals.order });
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

function orderContainsOneDish(req, res, next){
  const { data: { dishes } = { } } = req.body;
  if(dishes.length > 0){
    return next();
  } else {
    return next({
      status: 400, 
      message: `Order must contain at least one dish`
    });
  }
}

function dishIsAnArray(req, res, next){
  const { data: { dishes } = {} } = req.body; 
  if(typeof(dishes) == 'object'){
    return next();
  } else {
    return next({
      status: 400, 
      message: 'Order dish must be an array'
    })
  }
}

function dishContainsQuantity(req, res, next){
  const { data: { dishes } = {} } = req.body; 
  dishes.forEach((dish) => {
    if(!dish.quantity){
    return next({
      status: 400, 
      message: `Order must contain quantity of 1 or more. Cannot have 0 quantity.`
    })
    } else if(typeof(dish.quantity) !== 'number'){
      return next({
        status: 400, 
        message: `Field quantity be of type integer, example: 2`
      })
    }
  });
  
  return next();
}


function create(req, res){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body; 
  
    const newOrder = {
        id: nextId(),
        deliverTo, 
        mobileNumber, 
        status,
        dishes,
    }

    orders.push(newOrder)
    res.status(201).json({ data: newOrder });
}

module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        orderContainsOneDish,
        dishIsAnArray,
        dishContainsQuantity,
        create,
    ],
    list, 
    read: [orderExists, read],
}