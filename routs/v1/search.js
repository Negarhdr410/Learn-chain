const express = require("express")
const searshController = require("../../controllers/v1/search")

const router = express.Router()

router.route("/:keyword").get(searshController.get)

module.exports = router