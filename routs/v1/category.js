const express = require("express")
const CategoryController = require("../../controllers/v1/category")
const authMiddleware = require("../../middlewares/auth")
const isAdminMiddleware = require("../../middlewares/isAdmin")

const router = express.Router()

router.route("/")
    .post(authMiddleware, isAdminMiddleware, CategoryController.create)
    .get(CategoryController.getAll)

router.route("/:id")
    .delete(authMiddleware, isAdminMiddleware, CategoryController.remove)
    .put(authMiddleware, isAdminMiddleware, CategoryController.update)

module.exports = router