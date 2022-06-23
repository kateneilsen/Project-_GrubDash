const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const orderId = Number(req.params.orderId);
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${req.params.orderId}`,
  });
}

function read(req, res) {
  const orderId = Number(req.params.orderId);
  const foundOrder = orders.find((order) => order.id === orderId);
  res.json({ data: foundOrder });
}
//middleware to check if propertyName exists
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

//middleware functions to check if property is empty

function deliverToIsEmpty(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo === "") {
    next({
      status: 400,
      message: `Order must include ${deliverTo}`,
    });
  }
  return next();
}

function mobileNumberIsEmpty(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber === "") {
    next({
      status: 400,
      message: `Order must include ${mobileNumber}`,
    });
  }
  return next();
}

//check if dishes property is not an arry or is empty
function validateDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) || dishes.length <= 0) {
    next({
      status: 400,
      message: `Order must include a dish.`,
    });
  }
}

//middleware function to check if dish quantity is zero or less or if quantity property is not an integer
function invalidQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const notValidQuantity = dishes.find(
    (dish) => dish.quantity <= 0 || !Number.isInteger(dish.quantity)
  );
  if (notValidQuantity) {
    notValidQuantity.index = dishes.indexOf(notValidQuantity);
    next({
      status: 400,
      message: `Dish ${notValidQuantity} must have a quanity that is an integer and greater than 0`,
    });
  }
}

function idIsValid(req, res, next) {
  const orderId = Number(req.params.orderId);
  const { data: { id } = {} } = req.body;
  if (id === orderId) {
    return next();
  }
  next({
    status: 400,
    message: `Value of the ${id} property must match ${orderId}. Received: ${id}`,
  });
}

function statusIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: `Value of the 'status' property must be one of ${validStatus}. Received: ${status}`,
  });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, quantity, ...dishes } = {} } =
    req.body;
  if ((deliverTo, mobileNumber, dishes, quantity)) {
    const newOrder = {
      id: nextId,
      deliverTo,
      mobileNumber,
      quantity,
      dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }
}

function update(req, res) {
  const orderId = Number(req.params.orderId);
  const foundOrder = orders.find((order) => order.id === orderId);
  const {
    data: { status },
  } = req.body;

  //update order
  foundOrder.id = nextId();
  foundOrder.status = status;
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    bodyDataHas("quantity"),
    deliverToIsEmpty,
    mobileNumberIsEmpty,
    validateDishes,
    invalidQuantity,
    create,
  ],
  update: [bodyDataHas("status"), statusIsValid, update],
};
