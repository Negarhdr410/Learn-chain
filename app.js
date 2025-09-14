const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const authRouter = require("./routs/v1/auth")
const usersRouter = require("./routs/v1/user")
const categoriesRouter = require("./routs/v1/category")
const coursesRouter = require("./routs/v1/course")
const commentsRouter = require("./routs/v1/comment")
const contactsRouter = require("./routs/v1/contact")
const newsletterRouter = require("./routs/v1/newsletter")
const searchRouter = require("./routs/v1/search")
const notificationRouter = require("./routs/v1/notification")
const offsRouter = require("./routs/v1/off")
const articlesRouter = require("./routs/v1/article")
const ordersRouter = require("./routs/v1/order")
const ticketsRouter = require("./routs/v1/ticket")
const menusRouter = require("./routs/v1/menu")

const app = express()

// سرو استاتیک برای کاورها
app.use(
  "/courses/covers",
  express.static(path.join(__dirname, "public", "courses", "covers"))
)
// سرو استاتیک کل فولدر public
app.use(express.static("public"))

// صفحه اصلی -> auth.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"))
})

// ✅ روت برای /courses -> courses.html
app.get("/courses", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "courses.html"))
})

app.get("/courses/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "course-detail.html"))
})

app.get("/articles/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "articles.html"))
})

app.get("/articles/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "article-detail.html"))
})

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// API ها
app.use("/v1/auth", authRouter)
app.use("/v1/users", usersRouter)
app.use("/v1/categories", categoriesRouter)
app.use("/v1/courses", coursesRouter)
app.use("/v1/comments", commentsRouter)
app.use("/v1/contacts", contactsRouter)
app.use("/v1/newsletters", newsletterRouter)
app.use("/v1/search", searchRouter)
app.use("/v1/notifications", notificationRouter)
app.use("/v1/offs", offsRouter)
app.use("/v1/articles", articlesRouter)
app.use("/v1/orders", ordersRouter)
app.use("/v1/tickets", ticketsRouter)
app.use("/v1/menus", menusRouter)

module.exports = app
