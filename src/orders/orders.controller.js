const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  });
}

function validateDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'deliverTo' property is required.",
  });
}

function validateMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'mobileNumber' property is required.",
  });
}

//check if dishes property is not an arry or is empty
function validateDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes && Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: `Order must include at least one dish.`,
  });
}

function validateQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    const quantity = dish.quantity;
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function idIsValid(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  next();
}

function isStatusPending(req, res, next) {
  const status = res.locals.order.status;

  if (status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}

function isStatusInvalid(req, res, next) {
  const { data: { status } = {} } = req.body;

  if (status === "invalid" || !status || status.length === 0) {
    return next({
      status: 400,
      message: "An order must have a valid status to be changed",
    });
  }
  next();
}

function list(req, res) {
  res.json({ data: orders });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  //update order
  (foundOrder.deliverTo = deliverTo),
    (foundOrder.mobileNumber = mobileNumber),
    (foundOrder.status = status),
    (foundOrder.dishes = dishes),
    res.json({ data: foundOrder });
}

function destroy(req, res) {
  const orderId = Number(req.params.orderId);
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index);
  }
  res.sendStatus(204);
}

module.exports = {
  list,
  update: [
    orderExists,
    idIsValid,
    validateDeliverTo,
    validateMobileNumber,
    validateDishes,
    validateQuantity,
    isStatusInvalid,
    update,
  ],
  create: [
    validateDeliverTo,
    validateMobileNumber,
    validateDishes,
    validateQuantity,
    create,
  ],
  read: [orderExists, read],
  delete: [orderExists, isStatusPending, destroy],
};
