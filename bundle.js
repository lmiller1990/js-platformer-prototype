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
	const plan = __webpack_require__(7)
	const DOMDisplay = __webpack_require__(8)

	const simpleLevel = new Level(plan)

	console.log(`Created level: ${simpleLevel.width} by ${simpleLevel.height}`)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const actorChars = __webpack_require__(2)
	const Vector     = __webpack_require__(4)

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
	          this.actors.push(new Actor(new Vector(x ,y), ch))
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
	}

	module.exports = Lava


/***/ },
/* 4 */
/***/ function(module, exports) {

	class Vector {
	  constructor(x, y) {
	    this.x = x
	    this.y = y
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

	class Coin {
	  constructor(pos) {
	    this.type = 'coin'

	    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1))
	    this.size = new Vector(0.6, 0.6)
	    this.wobble = Math.random() * Math.PI * 2
	  }
	}

	module.exports = Coin



/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const Vector = __webpack_require__(4)

	class Player {
	  constructor (pos) {
	    this.type = 'player'

	    this.pos = pos.plus(new Vector(0, -0.5))
	    this.size = new Vector(0.8, 1.5)
	    this.speed = new Vector(0, 0)
	  }
	}

	module.exports = Player


/***/ },
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	const {SCALE} = __webpack_require__(9)

	class DOMDisplay {
	  constructor(parent, level) {
	    console.log(SCALE)
	    this.wrap = parent.appendChild(this.elt,('div', 'game'))
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
	      const rect = wrap.appendChild(elt('div', `actor ${actor.type}`))
	      rect.style.width = `${actor.size.y * SCALE}px`
	      rect.style.left = `${actor.pos.x * SCALE}px`
	      rect.style.top = `${actor.pos.y * SCALE}px`
	    })
	    return wrap
	  }

	  drawFrame () {
	    if (this.actorLayer) // check if it is the first time to draw the frame
	      this.wrap.removeChild(this.actorLayout)

	    this.actorLayout = this.wrap.appendChild(this.drawActor())
	    this.wrap.className = `game ${this.level.status || ''}`

	    this.scrollPlayerIntoView()
	  }

	  scrollPlayerIntoView () {

	  }

	  drawBackground () {
	    const table = this.elt('table', 'background')
	    table.style.width = `${this.level.width * SCALE}px`  
	    
	    this.level.grid.forEach(row => {
	      const rowElt = table.appendChild(elt('tr'))
	      rowElt.style.height = `${scale}px`
	      row.forEach(type => rowElt.appendChild(elt('td', type)))
	    })
	    return table
	  }
	}

	module.exports = DOMDisplay


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
	  SCALE: 20
	}


/***/ }
/******/ ]);