const articleModel = require("../../models/article")
const mongoose = require("mongoose")

exports.getAll = async (req, res) => {
    //کل مقالات را به کاربر نمایش میده

    const articles = await articleModel.find({}).populate("creator", "name").populate("categoryID", "title").lean()

    return res.json(articles)
}

exports.create = async (req, res) => {
    //مقاله ای را منتشر میکنه و به همه نشان میدهد 

    const { title, description, body, href, categoryID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(categoryID)

    if (!isvalid){
        return res.status(409).json({
            message: "CategoryId is not valid !!"
        })
    }

    const existArticle = await articleModel.findOne({ body })

   if (existArticle){
      const article = await articleModel.findOneAndUpdate({ _id: existArticle._id }, { publish: 1 })  

      const mainArticle = await articleModel.findById(article._id).populate("creator", "-password").populate("categoryID","title")

      return res.status(201).json(mainArticle)
   }

   const article = await articleModel.create({
    title,
    description,
    body,
    href,
    categoryID,
    publish: 1,
    creator: req.user._id,
    cover: req.file.filename
})

    const mainArticle = await articleModel.findById(article._id).populate("creator", "-password")

    return res.status(201).json(mainArticle)
}

exports.getOne = async (req, res) => {
    //مفاله ای با اچرفی که کاربر میخواد رو بهش نمایش میده

    const { href } = req.params

    const article = await articleModel.findOne({ href }).populate("categoryID", "title").populate("creator", "-password").lean()

    if (!article) {
        return res.status(404).json({ message: "This article not found!!" })
    }

    return res.json(article)
}

exports.remove = async (req, res) => {
    //مقاله ای با آیدی موردنظر حذف میشه

    const { id } = req.params

    const isValid = mongoose.Types.ObjectId.isValid(id)

    if (!isValid) {
        return res.status(409).json({ message: "ID is not valid!!" })
    }

    const deletedArticle = await articleModel.findOneAndDelete({ _id: id }).lean()

    if(!deletedArticle){
        return res.status(404).json({ message: "This article not found!!" })
    }

    return res.json(deletedArticle)
}

exports.saveDraft = async (req, res) => {
    //مقاله رو به صورت پیش فرض در دیتابیس ذخیره میکنه

    const { title, description, body, href, categoryID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(categoryID)

    if (!isvalid){
        return res.status(409).json({
            message: "CategoryId is not valid !!"
        })
    }

   const article = await articleModel.create({
    title,
    description,
    body,
    href,
    categoryID,
    publish: 0,
    creator: req.user._id,
    cover: req.file.filename
})

    const mainArticle = await articleModel.findById(article._id).populate("creator", "-password")

    return res.status(201).json(mainArticle)
}