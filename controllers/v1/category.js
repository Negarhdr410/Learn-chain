const registerValidator = require("../../validators/createCategory")
const categoryModel = require("../../models/category")
const { default: mongoose } = require("mongoose")

exports.create = async (req, res) => {
//کتگوری رو بوجود میاره
    
    const validationResult = registerValidator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const { title, href } = req.body
    const category = await categoryModel.create({ title, href })

    return res.status(201).json(category)
}

exports.getAll = async (req, res) => {
    //همه کتگوری ها رو نمایش میده

    const categories = await categoryModel.find({}).lean()

    return res.status(200).json(categories)
}

exports.remove = async (req, res) => {
    //کتگوری که میخوای رو حذف میکنه

    const { id } = req.params

    const isValidId = mongoose.Types.ObjectId.isValid(id)

    if (!isValidId){
        return res.status(409).json({
            message: "Category ID is not valid !!"
        })
    }

    const deletedCategory = await categoryModel.findOneAndDelete({ _id: id })

    if (!deletedCategory){
        return res.status(404).json({
            message: "Category not found !!"
        })
    }
    return res.status(200).json(deletedCategory)
}

exports.update = async (req, res) => {
    //اطلاعات کتگوری رو آپدیت میکنه

    const { id } = req.params
    const { title, href } = req.body

    const validationResult = registerValidator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const isValidId = mongoose.Types.ObjectId.isValid(id)

    if (!isValidId){
        return res.status(409).json({
            message: "Category ID is not valid !!"
        })
    }

    const updatedCategory = await categoryModel.findOneAndUpdate({ _id: id }, {
        title,
        href
    })

    if (!updatedCategory){
        return res.status(404).json({
            message: "Category not found !!"
        })
    }
    return res.status(200).json(updatedCategory)
}