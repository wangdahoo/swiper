/* eslint no-inner-declarations: off */

import './index.less'

// default swiper options
const defaultOptions = () => {
  return {
    itemClass: '.swiper-item',
    direction: 'horizontal',
    threshold: 30,
    duration: 250,
    transitionEnd: noop,
    auto: 5000,
    disableTouch: false
  }
}

// utilities
const extend = (target, source) => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }
  return target
}

function noop () {}

function execFn (fn) {
  setTimeout(fn || noop, 0)
}

function Swiper (container, swiperOptions = {}) {
  container = typeof container === 'string' ? document.querySelector(container) : container
  if (!(container instanceof HTMLElement)) return
  const options = extend(defaultOptions(), swiperOptions)

  let items = Array.prototype.slice.call(container.querySelectorAll(options.itemClass))
  let count = items.length
  let cloneItems = false
  if (count === 2) {
    for (let i = 0; i < items.length; i++) {
      container.append(items[i].cloneNode(true))
    }

    items = Array.prototype.slice.call(container.querySelectorAll(options.itemClass))
    count = items.length
    cloneItems = true
  }

  const transformed = {}
  let noTransition = []
  let current = 0
  let prev = 0

  let width = container.getBoundingClientRect().width || container.offsetWidth
  let height = container.getBoundingClientRect().height || container.offsetHeight
  width = Math.min(width, window.innerWidth)
  height = Math.min(height, window.innerHeight)

  const unit = options.direction === 'horizontal' ? width : height
  const tranformLimit = (count - 2) * unit

  // Setup
  function setup () {
    current = 0
    // reset container's width and height
    container.style.width = width + 'px'
    container.style.height = height + 'px'

    // set width, height, tranform for every single swipe item
    function initTransform (pos) {
      transformed[pos] = pos === count - 1 ? -unit : pos * unit

      return options.direction === 'horizontal'
        ? 'translate3d(' + transformed[pos] + 'px, 0, 0)'
        : 'translate3d(0, ' + transformed[pos] + 'px, 0)'
    }

    let pos = count
    while (pos--) {
      const { style } = items[pos]
      style.width = width + 'px'
      style.height = height + 'px'
      style.webkitTransition = style.transition = 'none'
      style.webkitTransform = style.transfrom = initTransform(pos)
    }
  }

  // Update items' tranformed map
  function setTranformed (backward = false) {
    // console.log(JSON.stringify(transformed))
    noTransition = []

    for (const k in transformed) {
      if (transformed.hasOwnProperty(k)) {
        if (backward) {
          if (transformed[k] + unit > tranformLimit) {
            transformed[k] -= tranformLimit + unit
            noTransition.push(~~k)
          } else {
            transformed[k] += unit
          }
        } else {
          if (transformed[k] - unit < -tranformLimit) {
            transformed[k] += tranformLimit + unit
            noTransition.push(~~k)
          } else {
            transformed[k] -= unit
          }
        }
      }
    }
  }

  // Calculate current by given index
  function setCurrent (index) {
    const activeIndex = current % count
    if (index < 0 || index > count - 1 || activeIndex === index) return

    let distance = Object.keys(transformed).reduce((obj, k) => {
      obj[k] = 0
      return obj
    }, {})

    const calDistance = (distance, oldTransformed, newTransformed, backward) => {
      return Object.keys(distance).reduce((newDistance, k) => {
        const val = newTransformed[k] - oldTransformed[k]

        if (backward && val < 0) {
          newDistance[k] += val
        }

        if (!backward && val > 0) {
          newDistance[k] += val
        }

        return newDistance
      }, distance)
    }

    if (index > activeIndex) {
      while (current % count < index) {
        current++
        const cloned = extend({}, transformed)
        setTranformed()
        distance = calDistance(distance, cloned, transformed, false)
      }
    } else {
      while (current % count > index) {
        current--
        const cloned = extend({}, transformed)
        setTranformed(true)
        distance = calDistance(distance, cloned, transformed, true)
      }
    }

    // console.log(Object.keys(distance).map(k => distance[k]))
    const re = /^translate3d\((((-?\d+)px, (0|0px), (0|0px))|((0|0px), (-?\d+)px, (0|0px)))\)$/

    for (let k in distance) {
      if (distance[k] !== 0) {
        const style = items[~~k] && items[~~k].style
        const result = re.exec(style.transform || style.webkitTransform)
        console.log(result)

        if (result && result[3]) {
          const oldVal = ~~(result && result[3])
          console.log(oldVal, `translate3d(${oldVal + distance[k]}px, 0, 0)`)
          style.transition = style.webkitTransition = 'none'
          style.transform = style.webkitTransform = `translate3d(${oldVal + distance[k]}px, 0, 0)`
        }

        if (result && result[7]) {
          const oldVal = ~~(result && result[7])
          style.transform = style.webkitTransform = `translate3d(0, ${oldVal + distance[k]}px, 0)`
        }
      }
    }
  }

  // Activate current item
  function activate () {
    let pos = count
    const duration = options.duration + 'ms'
    const direction = options.direction

    while (pos--) {
      const { style } = items[pos]

      function getTransform (pos) {
        if (direction === 'horizontal') {
          return `translate3d(${transformed[pos]}px, 0, 0)`
        }

        return `translate3d(0, ${transformed[pos]}px, 0)`
      }

      style.webkitTransition = style.transition = noTransition.indexOf(pos) > -1 ? 'none' : duration
      style.webkitTransform = style.transfrom = getTransform(pos)
    }
  }

  // Events

  // init varialbles

  const start = {}
  const move = {} // eslint-disable-line no-unused-vars
  const end = {}

  let timer = null
  const delay = options.auto

  function stop () {
    clearTimeout(timer)
    timer = null
  }

  function nextSlide () {
    stop()
    prev = current
    current++
    setTranformed()
    activate()
  }

  function prevSlide () {
    stop()
    prev = current
    current--
    setTranformed(true)
    activate()
  }

  function go (index) {
    if (index < 0 || index > count - 1) return
    stop()
    prev = current
    setCurrent(index)
    execFn(activate)
  }

  function begin () {
    timer = setTimeout(nextSlide, delay)
  }

  const events = {
    start: function (e) {
      const touch = e.changedTouches[0]
      start.x = touch.pageX
      start.y = touch.pageY
      start.time = +new Date()

      const style = container.style
      style.webkitTransition = style.transition = 'none'
    },

    move: function (e) {
      // TODO
    },

    end: function (e) {
      const touch = e.changedTouches[0]
      end.x = touch.pageX
      end.y = touch.pageY

      let dist = end.y - start.y
      if (options.direction === 'horizontal') {
        dist = end.x - start.x
      }

      if (Math.abs(dist) > options.threshold) {
        if (dist < 0) {
          prev = current
          current++
          setTranformed()
        } else {
          prev = current
          current--
          setTranformed(true)
        }

        activate()
      }
    },

    transitionEnd: function (e) {
      if (current === this.current) return
      this.current = current
      const _count = cloneItems ? 2 : count

      options.transitionEnd && options.transitionEnd.call(e, prev % _count, current % _count, _count)
      e.preventDefault()

      // 这里需要检查当前 swiper-item 中是否有 video 标签
      if (delay > 0 && timer === null && items[current % _count] && !items[current % _count].querySelector('video')) begin()
    }
  }

  function resize () {
    execFn(setup)
  }

  // bind events
  function bind () {
    if (!options.disableTouch) {
      container.addEventListener('touchstart', events.start)
      container.addEventListener('touchmove', events.move)
      container.addEventListener('touchend', events.end)
    }

    container.addEventListener('transitionEnd', noop)
    container.addEventListener('webkitTransitionEnd', events.transitionEnd)
    container.addEventListener('resize', resize)
  }

  function unbind () {
    container.removeEventListener('touchstart', events.start)
    container.removeEventListener('touchmove', events.move)
    container.removeEventListener('touchend', events.end)
    container.removeEventListener('transitionEnd', noop)
    container.removeEventListener('webkitTransitionEnd', events.transitionEnd)
    container.removeEventListener('resize', resize)
  }

  window.addEventListener('resize', resize)

  setup()
  bind()
  if (delay > 0 && items[0] && items[0].querySelector('video') === null) begin()

  // Publish APIs

  const instance = {
    resize: setup,

    destroy: function () {
      unbind()
      window.removeEventListener('resize', resize)
    },

    next: nextSlide,

    prev: prevSlide,

    go,

    activeIndex: function () {
      return current % (cloneItems ? 2 : count)
    },

    begin,

    stop
  }

  const getCount = {
    get: function () {
      return cloneItems ? 2 : count
    }
  }

  Object.defineProperty(instance, 'count', getCount)
  Object.defineProperty(instance, 'length', getCount)

  return instance
}

export default Swiper
