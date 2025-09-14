const validator = require("fastest-validator")

const v = new validator()

const schema= {
    title: { type: "string", min: 2, max: 50 },
    href: { type: "string", min: 2, max: 100 },
    $$strict: true
}

const check = v.compile(schema)

module.exports = check