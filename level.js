const actorChars = require('./actorChars')
const Vector     = require('./vector')
const {MAX_STEP} = require('./constants')

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

  animate (step, keys) {
    if (this.status !== null) {
      this.finishDelay -= step
    }

    while (step > 0) {
      const thisStep = Math.min(step, MAX_STEP)
      this.actors.forEach(actor => actor.act(thisStep, this, keys))
      step -= thisStep
    }
  } 

  actorAt (actor) {
    for (let i = 0; i < this.actors.length; i++) {
      const other = this.actors[i] // iterate each actor
      if (other !== actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y >  other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      {
        return other;
      }
    }
  }

  collisionLeft (other, actor) {
    return actor.pos.x < other.pos.x + other.size.x  
  }

  collisionRight (other, actor) {
    return actor.pos.x + actor.size.x > other.pos.x
  }

  collisionAbove (other, actor) {
    return actor.pos.y + actor.size.y > other.pos.y
  }

  collisionBelow (other, actor) {
    return actor.pos.y < other.pos.y + other.size.y
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

  playerTouched (type, actor) {
    if (type === 'lava' && this.status === null) {
      console.log('')
      this.status = 'lost'
      this.finishDelay = 1
    } else if (type === 'coin') {
      // return all actors except the coin - remove the coin we touched 
      this.actors = this.actors.filter(other => other !== actor) 
      if (!this.actors.some(a => a.type === 'coin')) {
        this.status = 'won'
        this.finishDelay = 1
      }
    }
  }
}

module.exports = Level
