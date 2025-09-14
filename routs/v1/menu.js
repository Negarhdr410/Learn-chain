const express = require("express")
const authMiddleware = require("../../middlewares/auth")
const isAdminMiddleware = require("../../middlewares/isAdmin")
const menusController = require("../../controllers/v1/menu")

const router = express.Router()

router.route("/").get(menusController.getAll).post(authMiddleware, isAdminMiddleware, menusController.create)

router.route("/all").get(authMiddleware, isAdminMiddleware, menusController.getAllInPanel)

router.route("/:id").delete(authMiddleware, isAdminMiddleware, menusController.remove)

module.exports = router