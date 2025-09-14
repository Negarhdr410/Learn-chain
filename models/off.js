const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    precent: {
        type: Number,
        required: true
    },
    course: {
        type: mongoose.Types.ObjectId,
        ref: "Course",
        required: true
    },
    max: {
        //تا حداکثر چقدر میتونه این کد استفاده شه
        type: Number,
        required: true
    },
    uses: {
        //تا الان چند بار این کد استفاده شده
        type: Number,
        required: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

const model = mongoose.model("Off", schema)

module.exports = model