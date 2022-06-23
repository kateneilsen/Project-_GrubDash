const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Must include a ${propertyName}`,
    });
  };
}

// //validation for name, description, image_url
// function propertyMustBeDefined(propertyName) {
//   return function (req, res, next) {
//     const {
//       data: {},
//     } = req.body;
//     if (data[propertyName] !== undefined) {
//       return next();
//     }
//     next({
//       status: 400,
//       message: `Must include a ${propertyName}`,
//     });
//   };
// }

//price validation
function priceIsValidNumber(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: `Expiration requires a valid number`,
    });
  }
  next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: dishes.length + 1,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}
//read
function read(req, res) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: foundDish });
}

//update
function update(req, res) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === Number(dishId));
  const { data: { name, description, price, image_url } = {} } = req.body;

  //update the dish
  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

module.exports = {
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceIsValidNumber,
    create,
  ],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceIsValidNumber,
    update,
  ],
};
