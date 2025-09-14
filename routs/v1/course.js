const express = require("express")
const courseController = require("../../controllers/v1/course")
const multer = require("multer")
const multerStorage = require("../../utils/uploader")
const authMiddleware = require("../../middlewares/auth")
const isAdminMiddleware = require("../../middlewares/isAdmin")

const router = express.Router()

router.route("/")
.post(
    multer({ storage: multerStorage, limits: { fileSize: 100000000}}).single("cover"),
    authMiddleware,
    isAdminMiddleware,
    courseController.create
)
.get(courseController.getAll)

router.route("/:id/sessions")
.post(
    // multer({ storage: multerStorage, limits: { fileSize: 100000000}}).single("video"),
    authMiddleware,
    isAdminMiddleware,
    courseController.createSession
)

router.route("/popular").get(courseController.popular)

router.route("/presell").get(courseController.presell)

router.route("/sessions").get(authMiddleware, isAdminMiddleware, courseController.getAllSessions)

router.route("/:href").get(courseController.getOne)

router.route("/related/:href").get(courseController.getRelated)

router.route("/sessions/:id").delete(authMiddleware, isAdminMiddleware, courseController.removeSession)

router.route("/category/:href").get(courseController.getCoursesByCategory)

router.route("/:href/:sessionID").get(authMiddleware, isAdminMiddleware, courseController.getSessionInfo)

router.route("/:id/register").post(authMiddleware, courseController.register)

router.route("/delete/:id").delete(authMiddleware, isAdminMiddleware, courseController.removeCourse)

module.exports = router