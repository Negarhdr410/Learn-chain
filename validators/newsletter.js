const validator = require("fastest-validator")

const v = new validator()

const schema = {
    email: { type: "email", min: 10, max: 100 },
}

const check = v.compile(schema)

module.exports = check