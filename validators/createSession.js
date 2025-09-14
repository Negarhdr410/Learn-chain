const validator = require("fastest-validator")
const mongoose = require("mongoose")

const v = new validator()

const schema = {
    title: { type: "string", min: 2, max: 100 },
    time: { type: "string", min: 2, max: 100 },
    free: { type: "string", max: 1 },
    video: { type: "string" },
    $$strict: true
}

const check = v.compile(schema)

module.exports = check