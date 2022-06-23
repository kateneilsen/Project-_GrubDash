function notValid(request, response, next) {
  next({ status: 400, message: `Order must include a ${propertyName}` });
}

module.exports = notValid;
