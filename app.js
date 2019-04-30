class Playground {
  constructor(height, width, hook) {
    this.height = height
    this.width = width
    this.DOM = document.querySelector(hook)
    this.time = 0

    this.timmer = setInterval(() => {
      this.time += 1
      document.querySelector('.timmer').innerText = this.time >= 60 ? `${Math.floor(this.time / 60)} mins ${this.time % 60} secs` : `${this.time} secs`
    }, 1000)
  }
}

class Block {
  // type = NORMAL | BOOM 
  constructor(type = 'NORMAL', col, row, id) {
    this.type = type
    this.nearbyBooms = 0
    this.col = col
    this.row = row
    this.id = id
    this.marked = false
    this.opened = false
  }
}

class Game extends Playground {
  constructor(height = 20, width = 20, hook, numberOfBoom) {
    super(height, width, hook)
    this.init = true
    this.blockList = []
    this.numberOfBoom = numberOfBoom
    this.createBlock()
  }

  createBlock() {
    let blockType = ['NORMAL', 'BOOM']
    let blockTypeList = [
      ...(new Int8Array(this.height * this.width - this.numberOfBoom).map(ele => (ele = 0))),
      ...(new Int8Array(this.numberOfBoom).map(ele => (ele = 1)))
    ].sort(() => (Math.floor(Math.random() * 3) - 1))
    this.blockList = blockTypeList
      .map((ele, index) => {
        return new Block(blockType[ele], index % this.width, Math.floor(index / this.width) === (Infinity || NaN) ? 0 : Math.floor(index / this.width), index)
      })

    this.DOM.style.cssText = `height: ${this.height * 40}px; width: ${this.width * 40}px; grid-template-columns: repeat(${this.width}, 1fr); grid-template-rows: repeat(${this.height}, 1fr);`
    this.DOM.innerHTML = this.blockList.map(ele => (`<div id="block-${ele.id}" class="block"></div>`)).join('')

    this.blockList.forEach(ele => {
      document.querySelector(`#block-${ele.id}`).addEventListener('contextmenu', event => {
        event.preventDefault()
        this.mark(ele.id)
      })

      document.querySelector(`#block-${ele.id}`).addEventListener('click', event => {
        event.preventDefault()

        if (this.init && ele.type === 'BOOM') {
          this.blockList[ele.id].type = 'NORMAL'
          this.blockList[this.blockList.filter(ele => (ele.type === 'NORMAL'))[Math.floor(Math.random() * (this.width * this.height - this.numberOfBoom))].id].type = 'BOOM'
          this.init = false
        }

        this.openBlock(ele.id)
      })
    })
  }

  openBlock(id) {
    let target = this.blockList[id]
    if (!target.opened) {
      target.opened = true

      switch (target.type) {
        case 'NORMAL':
          this.scanBoom(target.col, target.row)
          document.querySelector(`#block-${target.id}`).classList.add(`type-${target.nearbyBooms}`)
          break
        case 'BOOM':
          document.querySelector(`#block-${target.id}`).classList.add(`type-boom`)
          this.gameOver()
          break
      }
    }
  }

  mark(id) {
    let target = this.blockList[id]
    target.marked ?
      document.querySelector(`#block-${target.id}`).classList.remove(`type-mark`) :
      document.querySelector(`#block-${target.id}`).classList.add(`type-mark`)
    target.marked = !target.marked
  }

  scanBoom(col, row) {
    let targetList = []
    let target = this.blockList[row * this.width + col]

    for (let i = col - 1; i <= col + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        if ((i >= 0 && i < this.width) && (j >= 0 && j < this.height))
          targetList.push(this.blockList[j * this.width + i])
      }
    }

    let safe = targetList.filter(ele => (ele.type === 'NORMAL'))
    target.nearbyBooms = 9 - (safe.length + (
      (
        (target.col === 0 || target.col === this.width - 1) &&
        (target.row === 0 || target.row === this.height - 1)
      ) ?
      5 :
      (
        (target.col === 0 || target.col === this.width - 1) ?
        3 :
        (
          (target.row === 0 || target.row === this.height - 1) ?
          3 :
          0
        )
      )
    ))
    if (target.nearbyBooms === 0)
      safe.forEach(ele => (this.openBlock(ele.id)))

    if (this.checkStatus())
      this.win()
  }

  checkStatus() {
    return this.blockList.filter(ele => (ele.opened)).length === this.height * this.width - this.numberOfBoom
  }

  gameOver() {
    this.blockList.filter(ele => ele.type === 'BOOM').forEach(ele => {
      this.openBlock(ele.id)
    })
    clearInterval(this.timmer)
    document.querySelector('.gameover').classList.remove('hide')
  }

  win() {
    clearInterval(this.timmer)
    document.querySelector('.winner').classList.remove('hide')
  }
}

const game = new Game(9, 9, '.playground', 10)