const Vector = require('./vector')

class Player {
  constructor (pos) {
    this.type = 'player'

    this.pos = pos.plus(new Vector(0, -0.2))
    this.size = new Vector(0.8, 1.5)
    this.speed = new Vector(0, 0)
  }
}

module.exports = Player
