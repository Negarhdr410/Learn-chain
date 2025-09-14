const userModel = require("../../models/user")
const banUserModel = require ("../../models/ban-phone")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

exports.banUser = async (req, res) => {
    //اون کاربری که میخوای رو بن میکنه

    const mainUser = await userModel.findOne({ _id: req.params.id }).lean()
    const banUserResult = banUserModel.create({ phone: mainUser.phone })

    if (banUserResult) {
        return res.status(200).json({ message: "User ban successfully :))" })
    }

    return res.status(500).json({ message: "Server error !!"})
}

exports.getAll = async (req, res) => {
    //تمام کاربر ها رو بهت نشون میده

    const users = await userModel.find({}, "-password")

    res.json(users)
}

exports.removeUser = async (req, res) => {
    //کاربری که میخوای رو حذف میکنه

    const isValidId = mongoose.Types.ObjectId.isValid(req.params.id)

    if (!isValidId) {
        return res.status(409).json({
            message: "User ID is not valid !!"
        })
    }

    const removedUser = await userModel.findByIdAndDelete({ _id: req.params.id })

    if (!removedUser) {
        return res.status(404).json({
            message: "There is no user !!"
        })
    }

    return res.status(200).json({
        message: "User removed successfully :))"
    })
}

exports.changeRole = async (req, res) => {
    //رول اون کاربری که میخوای رو عوض میکنه

    const { id } = req.body
    const isValidId = mongoose.Types.ObjectId.isValid(id)

    if (!isValidId) {
        return res.status(409).json({
            message: "User ID is not valid !!"
        })
    }

    const user = await userModel.findOne({ _id: id })
    
    let newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    const updateduser = await userModel.findByIdAndUpdate(
        { _id: id },
        { role: newRole }
    )
    
    if (updateduser) {
        res.json({
            message: "User role changed successfully :))"
        })
    }
}

exports.updateUser = async (req, res) => {
    //اطلاعات اون کاربری که میخوای رو آپدیت میکنه

    const { username, name, email, phone, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await userModel.findByIdAndUpdate({ _id: req.user._id},
        {
            name,
            username,
            email,
            phone,
            password: hashedPassword
        }
    )
    .select("-password")
    .lean()

    return res.json(user)
}