const Vector = require('./vector')
const {WOBBLE_DIST, WOBBLE_SPEED} = require('./constants')
 
class Coin {
  constructor(pos) {
    this.type = 'coin'

    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1))
    this.size = new Vector(0.6, 0.6)
    this.wobble = Math.random() * Math.PI * 2
  }

  act (step) {
    this.wobble += step * WOBBLE_SPEED
    var wobblePos = Math.sin(this.wobble) * WOBBLE_DIST
    this.pos = this.basePos.plus(new Vector(0, wobblePos))
  }
}

module.exports = Coin

