const express = require("express")
const authMiddleware = require("../../middlewares/auth")
const ordersController = require("../../controllers/v1/order")

const router = express.Router()

router.route("/").get(authMiddleware, ordersController.getAll)
router.route("/:id").get(authMiddleware, ordersController.getOne)

module.exports = router