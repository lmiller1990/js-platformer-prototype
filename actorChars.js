const Lava = require('./lava')
const Coin = require('./coin')
const Player = require('./player')

module.exports = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava
}
