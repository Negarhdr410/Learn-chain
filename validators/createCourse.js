const validator = require("fastest-validator")

const v = new validator()

const schema = {
    name: { type: "string", min: 5, max: 100 },
    description: { type: "string", min:20 },
    support: { type: "string", min:2, max: 30 },
    href: { type: "string", min: 2, max:100 },
    price: { type: "string" },
    status: { type: "string", min: 2, max: 20 },
    categoryID: { type: "string"}
}

const check = v.compile(schema)

module.exports = check