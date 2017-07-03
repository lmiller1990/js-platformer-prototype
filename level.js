const actorChars = require('./actorChars')
const Vector     = require('./vector')

class Level {
  constructor(plan) {
    this.width = plan[0].length
    this.height = plan.length
    this.grid = []
    this.actors = [] // game objects that can move
    this.plan = plan
    this.status = null
    this.finishDelay = null

    this.setup()
  }

  setup () {
    for (let y in this.plan) {
      const line = this.plan[y]  
      const gridLine = []

      for (let x in this.plan[y]) {
        const ch = line[x]
        let fieldType = null
        const Actor = actorChars[ch]

        if (Actor) {
          this.actors.push(new Actor(new Vector(x, y), ch))
        } else if (ch === 'x') {
          fieldType = 'wall'
        } else if (ch ==='!') {
          fieldType = 'lava'
        }
        gridLine.push(fieldType)
      }
      this.grid.push(gridLine)
    }
    this.player = this.actors.filter(a => a.type === 'player')[0]
    this.status = this.finishDelay = null
  }

  isFinished () {
    return this.status !== null && this.finishDelay < 0
  }

  obstacleAt (pos, size) {
    const xStart = Math.floor(pos.x) 
    const xEnd = Math.ceil(pos.x + size.x)
    const yStart = Math.floor(pos.y)
    const yEnd = Math.ceil(pos.y + size.y)

    if (xStart < 0 || xEnd > this.width || yStart < 0) {
      return 'wall' // level bounds, can't leave
    }
    if (yEnd > this.height) {
      return 'lava' // the floor, dead
    }

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const fieldType = this.grid[y][x]
        if (fieldType) {
          return fieldType
        }
      }
    }
  }
}

module.exports = Level
