const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function bodyHasNameProperty(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'name' property is required.",
  });
}

function bodyHasDescriptionProperty(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'description' property is required.",
  });
}

function bodyHasImageProperty(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'image_url' property is required.",
  });
}

function bodyHasPriceProperty(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && Number.isInteger(price)) {
    return next();
  }
  next({
    status: 400,
    message: "A 'price' property is required.",
  });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

//read
function read(req, res) {
  const { dishId } = req.params;
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
  if (typeof price == "number") {
    foundDish.price = price;
  } else {
    next({
      status: 400,
      message: `Price is not a number.`,
    });
  }

  foundDish.image_url = image_url;
  res.json({ data: foundDish });
}

module.exports = {
  create: [
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    bodyHasImageProperty,
    create,
  ],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    bodyHasImageProperty,
    update,
  ],
};
