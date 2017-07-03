const Level = require('./level')

const arrowCodes = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT'
}

const runLevel = (level, Display, andThen) => {
  console.log('runLevel() called')
  const display = new Display(document.body, level)

  runAnimation((step) => {
    level.animate(step, arrows)
    display.drawFrame(step)

    if (level.isFinished()) {
      console.log('Level complete')
      display.clear()
      if (andThen) {
        andThen(level.status)
      }
      return false
    }
  })
}

const runAnimation = frameFunc => {
  let lastTime = null
  const frame = time => {
    let stop = false
    if (lastTime !== null) {
      const timeStep = Math.min(time - lastTime, 100) / 1000
      stop = frameFunc(timeStep) === false
    }
    lastTime = time
    if (!stop) {
      requestAnimationFrame(frame)
    }
  }
  requestAnimationFrame(frame)
}

const trackKeys = codes => {
  console.log('Tracking keys')
  const pressed = Object.create(null)
  const handler = event => {
    if (codes.hasOwnProperty(event.keyCode)) {
      const down = event.type === 'keydown'
      pressed[codes[event.keyCode]] = down
      event.preventDefault()
    }
  }
  addEventListener('keydown', handler)
  addEventListener('keyup', handler)
  return pressed
}

const arrows = trackKeys(arrowCodes)

const runGame = (plans, Display) => {
  const startLevel = n => {
    runLevel(new Level(plans[n]), Display, (status) => {
      if (status === 'lost') {
        startLevel(n)
      } else if (n < plans.length - 1) {
        startLevel(n + 1) 
      } else {
        console.log('You win!')
      }
    })
  }
  startLevel(0)
}

module.exports = runGame
