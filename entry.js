const Level = require('./level')
const plan = require('./simpleLevel')
const DOMDisplay = require('./domDisplay')

const simpleLevel = new Level(plan)

console.log(`Created level: ${simpleLevel.width} by ${simpleLevel.height}`)
