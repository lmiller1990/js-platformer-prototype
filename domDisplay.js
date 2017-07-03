const {SCALE} = require('./constants')

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
