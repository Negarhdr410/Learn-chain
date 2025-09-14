const mongoose = require("mongoose")
const courseUserModel = require("../../models/course-user")

exports.getAll = async (req, res) => {
    //سفارشاتی که کاربر توی اون دوره ها ثبت نام کرده رو به کلاینت نمایش میده

    const orders = await courseUserModel.find({ user: req.user._id }).populate("course", "name href").lean()

    return res.json(orders)
}

exports.getOne = async (req, res) => {
    //اطلاعات سفارش با اون آیدی وارد شده رو نشون میده

    const { id } = req.params
    const isValidId = mongoose.Types.ObjectId.isValid(id)

    if (!isValidId) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const order = await courseUserModel.findOne({ _id: id }).lean()

    return res.json(order)
}