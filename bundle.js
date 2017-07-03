/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Level = __webpack_require__(1)
	const plan = __webpack_require__(8)
	const levels = __webpack_require__(11)
	const DOMDisplay = __webpack_require__(9)
	const runGame = __webpack_require__(10)

	//const simpleLevel = new Level(plan)
	//const display = new DOMDisplay(document.body, simpleLevel)

	//runGame([plan], DOMDisplay)
	runGame(levels, DOMDisplay)

	//console.log(`Created level: ${simpleLevel.width} by ${simpleLevel.height}`)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const actorChars = __webpack_require__(2)
	const Vector     = __webpack_require__(4)
	const {MAX_STEP} = __webpack_require__(7)

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Lava = __webpack_require__(3)
	const Coin = __webpack_require__(5)
	const Player = __webpack_require__(6)

	module.exports = {
	  "@": Player,
	  "o": Coin,
	  "=": Lava,
	  "|": Lava,
	  "v": Lava
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	const Vector = __webpack_require__(4)

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


/***/ },
/* 4 */
/***/ function(module, exports) {

	class Vector {
	  constructor(x, y) {
	    this.x = parseFloat(x)
	    this.y = parseFloat(y)
	  }

	  plus (other) {
	    return new Vector(this.x + other.x, this.y + other.y)
	  }

	  times (factor) {
	    return new Vector(this.x * factor, this.y * factor)
	  }
	}

	module.exports = Vector


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	const Vector = __webpack_require__(4)
	const {WOBBLE_DIST, WOBBLE_SPEED} = __webpack_require__(7)
	 
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



/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const Vector = __webpack_require__(4)
	const {PLAYER_JUMP_SPEED, PLAYER_X_MOVE_SPEED, GRAVITY} = __webpack_require__(7)

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


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
	  SCALE: 20,
	  MAX_STEP: 0.05,
	  PLAYER_X_MOVE_SPEED: 7,
	  PLAYER_JUMP_SPEED: 16,
	  GRAVITY: 30,
	  WOBBLE_SPEED: 5,
	  WOBBLE_DIST: 0.07
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	var simpleLevelPlan = [
	  "                      ",
	  "                      ",
	  "  x              = x  ",
	  "  x         o o    x  ",
	  "  x @      xxxxx   x  ",
	  "  xxxxx            x  ",
	  "      x!!!!!!!!!!!!x  ",
	  "      xxxxxxxxxxxxxx  ",
	  "                      "
	]

	module.exports = simpleLevelPlan


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	const {SCALE} = __webpack_require__(7)

	class DOMDisplay {
	  constructor(parent, level) {
	    this.wrap = parent.appendChild(this.elt('div', 'game'))
	    this.level = level

	    this.wrap.appendChild(this.drawBackground())
	    this.actorLayer = null
	    this.drawFrame()
	  }

	  elt (name, className) {
	    const elt = document.createElement(name)
	    if (className) {
	      elt.className = className
	    }
	    return elt
	  }

	  drawActors () {
	    const wrap = this.elt('div')
	    this.level.actors.forEach(actor => {
	      const rect = wrap.appendChild(this.elt('div', `actor ${actor.type}`))
	      rect.style.width = actor.size.x * SCALE + 'px'
	      rect.style.height = actor.size.y * SCALE + 'px'
	      rect.style.left = actor.pos.x * SCALE + 'px'
	      rect.style.top = actor.pos.y * SCALE + 'px'
	    })
	    return wrap
	  }

	  drawFrame () {
	    if (this.actorLayer) { // check if it is the first time to draw the frame
	      this.wrap.removeChild(this.actorLayer)
	    }

	    this.actorLayer = this.wrap.appendChild(this.drawActors())
	    this.wrap.className = `game ${this.level.status || ''}`

	    this.scrollPlayerIntoView()
	  }

	  scrollPlayerIntoView () {
	    const width = this.wrap.clientWidth
	    const height = this.wrap.clientHeight
	    const margin = width / 3

	    // viewport
	    const left = this.wrap.scrollLeft 
	    const right = left + width
	    const top = this.wrap.scrollTop
	    const bottom = top + height
	    
	    const player = this.level.player
	    const center = player.pos.plus(player.size.times(0.5)).times(SCALE)

	    if (center.x < left + margin) {
	      this.wrap.scrollLeft = center.x - margin
	    } else if (center.x > right - margin) {
	      this.wrap.scrollLeft = center.x + margin - width 
	    }

	    if (center.y < top + margin) {
	      this.wrap.scrollTop = center.y - margin
	    } else if (center.y > bottom - margin) {
	      this.wrap.scrollTop = center.y + margin - height
	    }
	  }

	  clear () {
	    this.wrap.parentNode.removeChild(this.wrap)
	  }

	  drawBackground () {
	    const table = this.elt('table', 'background')
	    table.style.width = `${this.level.width * SCALE}px`  
	    
	    this.level.grid.forEach(row => {
	      const rowElt = table.appendChild(this.elt('tr'))
	      rowElt.style.height = `${SCALE}px`
	      row.forEach(type => rowElt.appendChild(this.elt('td', type)))
	    })
	    return table
	  }
	}

	module.exports = DOMDisplay


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	const Level = __webpack_require__(1)

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


/***/ },
/* 11 */
/***/ function(module, exports) {

	var GAME_LEVELS = [
	  ["                                                                                ",
	   "                                                                                ",
	   "                                                                                ",
	   "                                                                                ",
	   "                                                                                ",
	   "                                                                                ",
	   "                                                                  xxx           ",
	   "                                                   xx      xx    xx!xx          ",
	   "                                    o o      xx                  x!!!x          ",
	   "                                                                 xx!xx          ",
	   "                                   xxxxx                          xvx           ",
	   "                                                                            xx  ",
	   "  xx                                      o o                                x  ",
	   "  x                     o                                                    x  ",
	   "  x                                      xxxxx                             o x  ",
	   "  x          xxxx       o                                                    x  ",
	   "  x  @       x  x                                                xxxxx       x  ",
	   "  xxxxxxxxxxxx  xxxxxxxxxxxxxxx   xxxxxxxxxxxxxxxxxxxx     xxxxxxx   xxxxxxxxx  ",
	   "                              x   x                  x     x                    ",
	   "                              x!!!x                  x!!!!!x                    ",
	   "                              x!!!x                  x!!!!!x                    ",
	   "                              xxxxx                  xxxxxxx                    ",
	   "                                                                                ",
	   "                                                                                "],
	  ["                                      x!!x                        xxxxxxx                                    x!x  ",
	   "                                      x!!x                     xxxx     xxxx                                 x!x  ",
	   "                                      x!!xxxxxxxxxx           xx           xx                                x!x  ",
	   "                                      xx!!!!!!!!!!xx         xx             xx                               x!x  ",
	   "                                       xxxxxxxxxx!!x         x                                    o   o   o  x!x  ",
	   "                                                xx!x         x     o   o                                    xx!x  ",
	   "                                                 x!x         x                                xxxxxxxxxxxxxxx!!x  ",
	   "                                                 xvx         x     x   x                        !!!!!!!!!!!!!!xx  ",
	   "                                                             xx  |   |   |  xx            xxxxxxxxxxxxxxxxxxxxx   ",
	   "                                                              xx!!!!!!!!!!!xx            v                        ",
	   "                                                               xxxx!!!!!xxxx                                      ",
	   "                                               x     x            xxxxxxx        xxx         xxx                  ",
	   "                                               x     x                           x x         x x                  ",
	   "                                               x     x                             x         x                    ",
	   "                                               x     x                             xx        x                    ",
	   "                                               xx    x                             x         x                    ",
	   "                                               x     x      o  o     x   x         x         x                    ",
	   "               xxxxxxx        xxx   xxx        x     x               x   x         x         x                    ",
	   "              xx     xx         x   x          x     x     xxxxxx    x   x   xxxxxxxxx       x                    ",
	   "             xx       xx        x o x          x    xx               x   x   x               x                    ",
	   "     @       x         x        x   x          x     x               x   x   x               x                    ",
	   "    xxx      x         x        x   x          x     x               x   xxxxx   xxxxxx      x                    ",
	   "    x x      x         x       xx o xx         x     x               x     o     x x         x                    ",
	   "!!!!x x!!!!!!x         x!!!!!!xx     xx!!!!!!!!xx    x!!!!!!!!!!     x     =     x x         x                    ",
	   "!!!!x x!!!!!!x         x!!!!!xx       xxxxxxxxxx     x!!!!!!!xx!     xxxxxxxxxxxxx xx  o o  xx                    ",
	   "!!!!x x!!!!!!x         x!!!!!x    o                 xx!!!!!!xx !                    xx     xx                     ",
	   "!!!!x x!!!!!!x         x!!!!!x                     xx!!!!!!xx  !                     xxxxxxx                      ",
	   "!!!!x x!!!!!!x         x!!!!!xx       xxxxxxxxxxxxxx!!!!!!xx   !                                                  ",
	   "!!!!x x!!!!!!x         x!!!!!!xxxxxxxxx!!!!!!!!!!!!!!!!!!xx    !                                                  ",
	   "!!!!x x!!!!!!x         x!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!xx     !                                                  "],
	  ["                                                                                                              ",
	   "                                                                                                              ",
	   "                                                                                                              ",
	   "                                                                                                              ",
	   "                                                                                                              ",
	   "                                        o                                                                     ",
	   "                                                                                                              ",
	   "                                        x                                                                     ",
	   "                                        x                                                                     ",
	   "                                        x                                                                     ",
	   "                                        x                                                                     ",
	   "                                       xxx                                                                    ",
	   "                                       x x                 !!!        !!!  xxx                                ",
	   "                                       x x                 !x!        !x!                                     ",
	   "                                     xxx xxx                x          x                                      ",
	   "                                      x   x                 x   oooo   x       xxx                            ",
	   "                                      x   x                 x          x      x!!!x                           ",
	   "                                      x   x                 xxxxxxxxxxxx       xxx                            ",
	   "                                     xx   xx      x   x      x                                                ",
	   "                                      x   xxxxxxxxx   xxxxxxxx              x x                               ",
	   "                                      x   x           x                    x!!!x                              ",
	   "                                      x   x           x                     xxx                               ",
	   "                                     xx   xx          x                                                       ",
	   "                                      x   x= = = =    x            xxx                                        ",
	   "                                      x   x           x           x!!!x                                       ",
	   "                                      x   x    = = = =x     o      xxx       xxx                              ",
	   "                                     xx   xx          x                     x!!!x                             ",
	   "                              o   o   x   x           x     x                xxv        xxx                   ",
	   "                                      x   x           x              x                 x!!!x                  ",
	   "                             xxx xxx xxx xxx     o o  x!!!!!!!!!!!!!!x                   vx                   ",
	   "                             x xxx x x xxx x          x!!!!!!!!!!!!!!x                                        ",
	   "                             x             x   xxxxxxxxxxxxxxxxxxxxxxx                                        ",
	   "                             xx           xx                                         xxx                      ",
	   "  xxx                         x     x     x                                         x!!!x                xxx  ",
	   "  x x                         x    xxx    x                                          xxx                 x x  ",
	   "  x                           x    xxx    xxxxxxx                        xxxxx                             x  ",
	   "  x                           x           x                              x   x                             x  ",
	   "  x                           xx          x                              x x x                             x  ",
	   "  x                                       x       |xxxx|    |xxxx|     xxx xxx                             x  ",
	   "  x                xxx             o o    x                              x         xxx                     x  ",
	   "  x               xxxxx       xx          x                             xxx       x!!!x          x         x  ",
	   "  x               oxxxo       x    xxx    x                             x x        xxx          xxx        x  ",
	   "  x                xxx        xxxxxxxxxxxxx  x oo x    x oo x    x oo  xx xx                    xxx        x  ",
	   "  x      @          x         x           x!!x    x!!!!x    x!!!!x    xx   xx                    x         x  ",
	   "  xxxxxxxxxxxxxxxxxxxxxxxxxxxxx           xxxxxxxxxxxxxxxxxxxxxxxxxxxxx     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ",
	   "                                                                                                              ",
	   "                                                                                                              "],
	  ["                                                                                                  xxx x       ",
	   "                                                                                                      x       ",
	   "                                                                                                  xxxxx       ",
	   "                                                                                                  x           ",
	   "                                                                                                  x xxx       ",
	   "                          o                                                                       x x x       ",
	   "                                                                                             o o oxxx x       ",
	   "                   xxx                                                                                x       ",
	   "       !  o  !                                                xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx       ",
	   "       x     x                                                x   x x   x x   x x   x x   x x   x x           ",
	   "       x= o  x            x                                   xxx x xxx x xxx x xxx x xxx x xxx x xxxxx       ",
	   "       x     x                                                  x x   x x   x x   x x   x x   x x     x       ",
	   "       !  o  !            o                                  xxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxxxx       ",
	   "                                                                                                              ",
	   "          o              xxx                              xx                                                  ",
	   "                                                                                                              ",
	   "                                                                                                              ",
	   "                                                      xx                                                      ",
	   "                   xxx         xxx                                                                            ",
	   "                                                                                                              ",
	   "                          o                                                     x      x                      ",
	   "                                                          xx     xx                                           ",
	   "             xxx         xxx         xxx                                 x                  x                 ",
	   "                                                                                                              ",
	   "                                                                 ||                                           ",
	   "  xxxxxxxxxxx                                                                                                 ",
	   "  x         x o xxxxxxxxx o xxxxxxxxx o xx                                                x                   ",
	   "  x         x   x       x   x       x   x                 ||                  x     x                         ",
	   "  x  @      xxxxx   o   xxxxx   o   xxxxx                                                                     ",
	   "  xxxxxxx                                     xxxxx       xx     xx     xxx                                   ",
	   "        x=                  =                =x   x                     xxx                                   ",
	   "        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   x!!!!!!!!!!!!!!!!!!!!!xxx!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
	   "                                                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
	   "                                                                                                              "]
	];

	if (typeof module != "undefined" && module.exports)
	  module.exports = GAME_LEVELS;


/***/ }
/******/ ]);