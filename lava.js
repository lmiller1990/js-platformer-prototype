const Vector = require('./vector')

class Lava {
  constructor (pos, ch) {
    this.type = 'lava'

    this.pos = pos
    this.size = new Vector(1, 1)

    if (ch === '=') {
      this.speed = new Vector(2, 0)
    } else if (ch === '|') {
      this.speed = new Vector(0, 2)
    } else if (ch === 'v') {
      this.speed = new Vector(0, 3)
      this.repeatPos = pos
    }
  }

  act (step, level) {
    const newPos = this.pos.plus(this.speed.times(step))
    if (!level.obstacleAt(newPos, this.size)) {
      this.pos = newPos
    } else if (this.repeatPos) {
      this.pos = this.repeatPos
    } else {
      this.speed = this.speed.times(-1)
    }
  }
}

module.exports = Lava
