const contactModel = require("../../models/contact")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const auth = require("../../middlewares/auth")

exports.getAll = async (req, res) => {
    //کل درخواست های کانتکت رو به مدیر نشون میده

    const contacts = await contactModel.find({}).lean()

    res.json(contacts)
}

exports.create = async (req, res) => {
    //ارسال پیام برای ارتباط با ما

    const { name, email, phone, body } = req.body

    const contact = await contactModel.create({
        name,
        email,
        phone,
        answer: 0,
        body
    })

    return res.status(201).json(contact)
}

exports.remove = async (req, res) => {
    // کانتکی طبق خواسته مدیر حذف میشه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedContact = await contactModel.findOneAndDelete({ _id: id }).lean()

    if(!deletedContact) {
        return res.status(404).json({
            message: "This contact not found!!"
        })
    }

    res.json(deletedContact)
}

exports.answer = async (req, res) => {
    //به کامنت کاربر حواب میده و این جواب برای کاربر ایمیل میشه
    
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "negar.heidari1384@gmail.com",
            pass: "ufpuhmisxbfdywde"
        }
    })

    const mailOptions = {
        from: "negar.heidari1384@gmail.com",
        to: req.body.email,
        subject: "پاسخ پیغام شما از سمت آکادمی سبزلرن",
        text: req.body.answer
    }

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            return res.json({ message: error })
        } else {
            const contact = await contactModel.findOneAndUpdate({ email: req.body.email }, {
                answer: 1
            })
            return res.json({ message: "Email sent successfully :))" })
        }
    })
}