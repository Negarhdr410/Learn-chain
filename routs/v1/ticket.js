const express = require("express")
const ticketController = require("../../controllers/v1/ticket")
const authMiddleware = require("./../../middlewares/auth")
const isAdminMiddleware = require("./../../middlewares/isAdmin")

const router = express.Router()

router.route("/")
    .get(authMiddleware, isAdminMiddleware, ticketController.getAll)
    .post(authMiddleware, ticketController.create)

router.route("/user").get(authMiddleware, ticketController.userTickets)

router.route("/departments").get(ticketController.departments)

router.route("/departments/:id/subs").get(ticketController.departmentsSubs)

router.route("/answer").post(authMiddleware, isAdminMiddleware, ticketController.setAnswer)

router.route("/:id/answer").get(authMiddleware, ticketController.getAnswer)

module.exports = router