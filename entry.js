const Level = require('./level')
const plan = require('./simpleLevel')
const levels = require('./game_levels')
const DOMDisplay = require('./domDisplay')
const runGame = require('./engine')

//const simpleLevel = new Level(plan)
//const display = new DOMDisplay(document.body, simpleLevel)

//runGame([plan], DOMDisplay)
runGame(levels, DOMDisplay)

//console.log(`Created level: ${simpleLevel.width} by ${simpleLevel.height}`)
