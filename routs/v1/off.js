const express = require("express")
const offCotroller = require("../../controllers/v1/off")
const isAdminMiddleware = require("../../middlewares/isAdmin")
const authMiddleware = require("../../middlewares/auth")
const { isAbsolute } = require("path")

const router = express.Router()

router.route("/")
    .get(authMiddleware, isAdminMiddleware, offCotroller.getAll)
    .post(authMiddleware, isAdminMiddleware, offCotroller.create)

router.route("/all").post(authMiddleware, isAdminMiddleware, offCotroller.setOnAll)

router.route("/:code").post(authMiddleware, offCotroller.getOne)

router.route("/:id/remove").delete(authMiddleware, isAdminMiddleware, offCotroller.remove)

module.exports = router