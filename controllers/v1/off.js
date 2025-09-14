const mongoose = require("mongoose")
const offModel = require("../../models/off")
const courseModel = require("../../models/course")

exports.getAll = async (req, res) => {
    //همه کد های ایحاد شدخ رو نمایش میده
    const offs = await offModel
        .find({}, "-__v")
        .populate("course", "name href")
        .populate("creator", "name")

    return res.json(offs)
}

exports.create = async (req, res) => {
    //کد تخفیف میسازه

    const { code, precent, course, max } = req.body

    const isCourseValid = mongoose.Types.ObjectId.isValid(course)

    if (!isCourseValid){
        return res.status(409).json({
            message: "CourseID is not valid !!"
        })
    }

    const newOff = await offModel.create({
        code,
        precent,
        course,
        max,
        uses: 0,
        creator: req.user._id
    })

    return res.status(201).json(newOff)
}

exports.setOnAll = async (req, res) => {
    //کد تخفیفی روی همه دوره ها اعمال میکنه

    const { discount } = req.body

    const coursesDiscounts = await courseModel.updateMany({ discount })

    return res.json({ message: "Discounts set successfully :))" })
}

exports.getOne = async (req, res) => {
    //اطلاعات اون کد تخفیف رو که دادیم بهمون برمیگردونه

    const { code } = req.params
    const { course } = req.body

    const isCourseValid = mongoose.Types.ObjectId.isValid(course)

    if (!isCourseValid){
        return res.status(409).json({
            message: "CourseID is not valid !!"
        })
    }

    const off = await offModel.findOne({ code, course }).lean()

    if (!off) {
        return res.status(404).json({ message: "Code is not valid" })
    } else if(off.max == off.uses) {
        return res.status(409).json({ message: "This code already used !!" })
    } else {
        await offModel.findOneAndUpdate(
            { code, course },
            { uses: off.uses + 1 } 
        )

        return res.json(off)
    }

}

exports.remove = async (req, res) => {
    //کد تخفیف مورد نظر رو حذف میکنه

    const { id } = req.params

    const deletedOff = await offModel.findOneAndDelete({ _id: id }).lean()

    return res.json(deletedOff)
}