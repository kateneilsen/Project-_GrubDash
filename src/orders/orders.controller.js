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
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
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

function update(req, res) {
  const orderId = Number(req.params.orderId);
  const foundOrder = orders.find((order) => order.id === orderId);
  const {
    data: { status },
  } = req.body;

  //update order
  foundOrder.id = orderId;
  foundOrder.status = status;
}

module.exports = {
  list,
  read,
  update: [bodyDataHas("status"), statusIsValid, update],
};
