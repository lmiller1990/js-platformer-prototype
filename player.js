const Vector = require('./vector')
const {PLAYER_JUMP_SPEED, PLAYER_X_MOVE_SPEED, GRAVITY} = require('./constants')

class Player {
  constructor (pos) {
    this.type = 'player'

    this.pos = pos.plus(new Vector(0, -1.5))
    this.size = new Vector(0.8, 1.5)
    this.speed = new Vector(0, 0)
  }

  moveX (step, level, keys) {
    this.speed.x = 0
    if (keys.LEFT) this.speed.x -= PLAYER_X_MOVE_SPEED
    if (keys.RIGHT) this.speed.x += PLAYER_X_MOVE_SPEED

    const motion = new Vector(this.speed.x * step, 0)
    const newPos = this.pos.plus(motion)
    const obstacle = level.obstacleAt(newPos, this.size)
    if (obstacle) {
      level.playerTouched(obstacle) // what did he collide with
    } else {
      this.pos = newPos // he can move!
    }
  }

  moveY (step, level, keys) {
    this.speed.y += step * GRAVITY
    const motion = new Vector(0, this.speed.y * step)
    const newPos = this.pos.plus(motion)
    const obstacle = level.obstacleAt(newPos, this.size)

    if (obstacle) {
      level.playerTouched(obstacle)
      if (keys.UP && this.speed.y > 0) {
        this.speed.y = -PLAYER_JUMP_SPEED // let's jump
      } else {
        this.speed.y = 0 // he is on the ground or hit something
      }
    } else {
      this.pos = newPos // he can move
    }
  }

  act (step, level, keys) {
    this.moveX(step, level, keys)
    this.moveY(step, level, keys)
    
    const otherActor = level.actorAt(this) // is there someone else colliding with player
    if (otherActor) {  // there is
      level.playerTouched(otherActor.type, otherActor) // see what it is

      if (level.status === 'lost') {
        this.pos.y += step
        this.size.y -= step // dying animation
      }
    }
  }
}

module.exports = Player
