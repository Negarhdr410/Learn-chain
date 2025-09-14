const notificationModel = require("../../models/notification")
const createValidator = require("../../validators/createNotification")
const mongoose = require("mongoose")

exports.create = async (req, res) => {
    //نوتیفیکیشن توسط مدیر ساخته میشود

    const validationResult = createValidator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const { message, admin } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(admin)

    if (!isvalid){
        return res.status(409).json({
            message: "AdminID is not valid !!"
        })
    }

    const notification = await notificationModel.create({ message, admin })

    return res.status(201).json(notification)
}

exports.get = async (req, res) => {
    const { _id } = req.user

    const adminNotifications = await notificationModel.find({ admin: _id }).lean()

    return res.json(adminNotifications)
}

exports.seen = async (req, res) => {
    //نوتیفیکیشنی که آیدی اون وارد شده سین میخوره

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if (!isvalid){
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const seenNotification = await notificationModel.findOneAndUpdate({ _id: id }, { seen: 1 }).lean()

    return res.json(seenNotification)
}

exports.getAll = async (req, res) => {
    //کل نوتیفیکیشن ها رو به مدیر نشون میده

    const notifications = await notificationModel.find({}).lean()

    return res.json(notifications)
}

exports.remove = async (req, res) => {
    //نوتیفیکیشنی که مدیر میخواد رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if (!isvalid){
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedNotification = await notificationModel.findOneAndDelete({ _id: id }).lean()

    return res.json(deletedNotification)
}