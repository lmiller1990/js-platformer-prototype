const Vector = require('./vector')

class Coin {
  constructor(pos) {
    this.type = 'coin'

    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1))
    this.size = new Vector(0.6, 0.6)
    this.wobble = Math.random() * Math.PI * 2
  }
}

module.exports = Coin

