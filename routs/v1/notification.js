const express = require("express")
const notificationsCotroller = require("../../controllers/v1/notification")
const authMiddleware = require("./../../middlewares/auth")
const isAdminMiddleware = require("./../../middlewares/isAdmin")

const router = express.Router()

router.route("/")
    .post(authMiddleware, isAdminMiddleware, notificationsCotroller.create)
    .get(authMiddleware, isAdminMiddleware, notificationsCotroller.getAll)

router.route("/admins").get(authMiddleware, isAdminMiddleware, notificationsCotroller.get)

router.route("/:id/see").put(authMiddleware, isAdminMiddleware, notificationsCotroller.seen)

router.route("/:id/remove").delete(authMiddleware, isAdminMiddleware, notificationsCotroller.remove)

module.exports = router