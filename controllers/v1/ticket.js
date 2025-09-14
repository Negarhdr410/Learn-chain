const departmentsModel = require("../../models/department")
const departmentsSubsModel = require("../../models/department-sub")
const ticketsModel = require("../../models/ticket")
const mongoose = require("mongoose")

exports.getAll = async (req, res) => {
    //کل تیکت ها رو نشون میده

    const tickets = await ticketsModel.find({ answer: 0 }).populate("departmentID", "title").populate("departmentSubID", "title").populate("user", "name").lean()

    return res.json(tickets)
}

exports.create = async (req, res) => {
    //تیکتی رو ایحاد میکنه

    const { departmentID, departmentSubID, priority, title, body, course } = req.body

    const isvalidDepartment = mongoose.Types.ObjectId.isValid(departmentID)

    const isvalidDepartmentSub = mongoose.Types.ObjectId.isValid(departmentSubID)

    if(!isvalidDepartment || !isvalidDepartmentSub) {
        return res.status(409).json({
            message: "DepartmentID or DepartmentSubID is not valid !!"
        })
    }

    const ticket = await ticketsModel.create({
        departmentID,
        departmentSubID,
        priority,
        title,
        body,
        user: req.user._id,
        answer: 0,
        course,
        isAnswer: 0
    })

    const mainTicket = await ticketsModel.findOne({ _id: ticket._id }).populate("departmentID").populate("departmentSubID").populate("user", "-password").lean()

    return res.status(201).json(mainTicket)
}

exports.userTickets = async (req, res) => {
    //تیکت های یوزر موردنظر رو نمایش میده

    const tickets = await ticketsModel.find({ user: req.user._id }).sort({ _id: -1 }).populate("departmentID").populate("departmentSubID").populate("user", "-password").lean()

    return res.json(tickets)
}

exports.departments = async (req, res) => {
    // کل دپارتمان ها رو به نمایش میذاره

    const departments = await departmentsModel.find({}).lean()

    return res.json(departments)
}

exports.departmentsSubs = async (req, res) => {
    //میاد اون زیر محموعه های دپارتمان موردنظر رو با اطلاعاتش نمایش میده

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const departmentsSub = await departmentsSubsModel.find({ parent: id }).lean()

    return res.json(departmentsSub)
}

exports.setAnswer = async (req, res) => {
    //پاسخ یه تیکت رو میده

    const { body, ticketID } = req.body

    const isvalid = mongoose.Types.ObjectId.isValid(ticketID)

    if(!isvalid) {
        return res.status(409).json({
            message: "TicketID is not valid !!"
        })
    }

    const ticket = await ticketsModel.findOne({ _id: ticketID }).lean()

    const answer = await ticketsModel.create({
        title: "پاسخ تیکت شما",
        body,
        priority: ticket.priority,
        user: req.user._id,
        parent: ticketID,
        isAnswer: 1,
        answer: 0,
        departmentID: ticket.departmentID,
        departmentSubID: ticket.departmentSubID
    })

    await ticketsModel.findOneAndUpdate({ _id: ticketID }, { answer: 1 })

    return res.status(201).json(answer)
}

exports.getAnswer = async (req, res) => {
    //اطلاعات تیکت موردنظر رو همراه با پاسخ هاش به کاربر نمایش میده

    const { id } = req.params

    const isvalid = mongoose.Types.ObjectId.isValid(id)

    if(!isvalid) {
        return res.status(409).json({
            message: "ID is not valid !!"
        })
    }

    const ticket = await ticketsModel.findOne({ _id: id })

    const ticketAnswer = await ticketsModel.findOne({ parent: id })

    return res.json({
        ticket,
        ticketAnswer
    })
}