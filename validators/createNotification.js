const validator = require("fastest-validator")

const v = new validator()

const schema = {
    message: { type: "string", min: 2 }
}

const check = v.compile(schema)

module.exports = check