const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    course: {
        type: mongoose.Types.ObjectId,
        ref: "course"
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    price: {
        type: Number,
        required: true
    }
},{ timestamps: true })

const model = mongoose.model("CourseUser", schema)
module.exports = model