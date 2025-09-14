const newsletterModel = require("../../models/newsletter")
const validator = require("../../validators/newsletter")

exports.getAll = async (req, res) => {
    //کل ایمیل هایی که برای خبرنامه ثبت شدن رو نشون میده

    const newsletter = await newsletterModel.find({}).lean()
    
    return res.json(newsletter)
}

exports.create = async (req, res) => {
    //ایمیلی که کاربر میده رو توی بخش خبرنامه ذخیره میکنه

    const { email } = req.body

    const validationResult = validator(req.body)
    if (validationResult != true){
        return res.status(422).json(validationResult)
    }

    const newEmail = await newsletterModel.create({ email })

    return res.status(201).json(newEmail)
}