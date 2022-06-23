const router = require("express").Router();

// TODO: Implement the /orders routes needed to make the tests pass
const controller = require("./orders.controller");

router.route("/:orderId").get(controller.read).put(controller.update);
router.route("/").get(controller.list);

module.exports = router;
