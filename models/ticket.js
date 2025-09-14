const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    departmentID: {
        type: mongoose.Types.ObjectId,
        ref: "Department",
        required: true
    },
    departmentSubID: {
        type: mongoose.Types.ObjectId,
        ref: "DepartmentSub",
        required: true
    },
    priority: {
        type: Number, // 1 - 2 - 3
        required: true
    },
    title: {
        type :String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    answer: {
        type: Number, // 0 - 1
        required: true
    },
    course: {
        type: mongoose.Types. ObjectId,
        ref: "Course",
        required: false
    },
    parent: {
        type: mongoose.Types.ObjectId,
        ref: "Ticket",
        required: false
    },
    isAnswer: {
        type: Number, // 0 - 1
        required: true
    }
}, { timestamps: true })

const model = mongoose.model("Ticket", schema)

module.exports = model