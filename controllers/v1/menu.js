const menusModel = require("../../models/menu")
const mongoose = require("mongoose")

exports.getAll = async (req, res) => {
    //کل منو ها رو به صورتی که اون منو اصلی هست و زیرش ساب منو میاد به کاربر نشون میده

    const menus = await menusModel.find({}).lean()

    menus.forEach((menu) => {
        let submenus = []

        for (let i = 0; i < menus.length; i++){
            const mainMenu = menus[i] 

            if(String(mainMenu.parent) == String(menu._id)){
                // if (mainMenu.parent ?.equals(menu._id)) { این دو دستور ایف یه کار یکسان رو انحام میدن
                    submenus.push(menus.splice(i, 1)[0])

                    i -= 1
                // }
            }
        }

        menu.submenus = submenus
    })

    return res.json(menus)
}

exports.create = async (req, res) => {
    //منویی را ایحاد میکند

    const { title, href, parent } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(parent)

    if(!isvalid) {
        return res.status(409).json({
            message: "ParentID is not valid !!"
        })
    }

    const menu = await menusModel.create({ title, href, parent })

    return res.status(201).json(menu)
}

exports.getAllInPanel = async (req, res) => {
    //همه منو ها رو به مدیر نمایش میده

    const menus = await menusModel.find({}).populate("parent").lean()

    return res.json(menus)
}

exports.remove = async (req, res) => {
    //منو موردنظر رو حذف میکنه

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const deletedMenu = await menusModel.findOneAndDelete({ _id: id }).lean()

    return res.json(deletedMenu)
}