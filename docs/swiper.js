(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Swiper = factory());
}(this, (function () { 'use strict';

  /* eslint no-inner-declarations: off */

  var defaultOptions = function defaultOptions() {
    return {
      itemClass: '.swiper-item',
      direction: 'horizontal',
      threshold: 30,
      duration: 250,
      transitionEnd: noop,
      auto: 5000,
      disableTouch: false
    };
  }; // utilities


  var extend = function extend(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }

    return target;
  };

  function noop() {}

  function execFn(fn) {
    setTimeout(fn || noop, 0);
  }

  function Swiper(container) {
    var swiperOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!(this instanceof Swiper)) {
      return new Swiper(container, swiperOptions);
    }

    container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!(container instanceof HTMLElement)) return;
    var options = extend(defaultOptions(), swiperOptions);
    var items = Array.prototype.slice.call(container.querySelectorAll(options.itemClass));
    var count = items.length;
    var cloneItems = false;

    if (count === 2) {
      for (var i = 0; i < items.length; i++) {
        container.append(items[i].cloneNode(true));
      }

      items = Array.prototype.slice.call(container.querySelectorAll(options.itemClass));
      count = items.length;
      cloneItems = true;
    }

    var transformed = {};
    var noTransition = [];
    var current = 0;
    var prev = 0;
    var width = container.getBoundingClientRect().width || container.offsetWidth;
    var height = container.getBoundingClientRect().height || container.offsetHeight;
    width = Math.min(width, window.innerWidth);
    height = Math.min(height, window.innerHeight);
    var unit = options.direction === 'horizontal' ? width : height;
    var tranformLimit = (count - 2) * unit; // Setup

    function setup() {
      current = 0; // reset container's width and height

      container.style.width = width + 'px';
      container.style.height = height + 'px'; // set width, height, tranform for every single swipe item

      function initTransform(pos) {
        transformed[pos] = pos === count - 1 ? -unit : pos * unit;
        return options.direction === 'horizontal' ? 'translate3d(' + transformed[pos] + 'px, 0, 0)' : 'translate3d(0, ' + transformed[pos] + 'px, 0)';
      }

      var pos = count;

      while (pos--) {
        var style = items[pos].style;
        style.width = width + 'px';
        style.height = height + 'px';
        style.webkitTransition = style.transition = 'none';
        style.webkitTransform = style.transfrom = initTransform(pos);
      }
    } // Update items' tranformed map


    function setTranformed() {
      var backward = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      noTransition = [];

      for (var k in transformed) {
        if (transformed.hasOwnProperty(k)) {
          if (backward) {
            if (transformed[k] + unit > tranformLimit) {
              transformed[k] -= tranformLimit + unit;
              noTransition.push(~~k);
            } else {
              transformed[k] += unit;
            }
          } else {
            if (transformed[k] - unit < -tranformLimit) {
              transformed[k] += tranformLimit + unit;
              noTransition.push(~~k);
            } else {
              transformed[k] -= unit;
            }
          }
        }
      }
    } // Calculate current by given index


    function setCurrent(index) {
      var activeIndex = current % count;
      if (index < 0 || index > count - 1 || activeIndex === index) return;
      var distance = Object.keys(transformed).reduce(function (obj, k) {
        obj[k] = 0;
        return obj;
      }, {});

      var calDistance = function calDistance(distance, oldTransformed, newTransformed, backward) {
        return Object.keys(distance).reduce(function (newDistance, k) {
          var val = newTransformed[k] - oldTransformed[k];

          if (backward && val < 0) {
            newDistance[k] += val;
          }

          if (!backward && val > 0) {
            newDistance[k] += val;
          }

          return newDistance;
        }, distance);
      };

      if (index > activeIndex) {
        while (current % count < index) {
          current++;
          var cloned = extend({}, transformed);
          setTranformed();
          distance = calDistance(distance, cloned, transformed, false);
        }
      } else {
        while (current % count > index) {
          current--;

          var _cloned = extend({}, transformed);

          setTranformed(true);
          distance = calDistance(distance, _cloned, transformed, true);
        }
      }

      var re = /^translate3d\((((-?\d+)px, (0|0px), (0|0px))|((0|0px), (-?\d+)px, (0|0px)))\)$/;

      for (var k in distance) {
        if (distance[k] !== 0) {
          var style = items[~~k] && items[~~k].style;
          var result = re.exec(style.transform || style.webkitTransform);

          if (result && result[3]) {
            var oldVal = ~~(result && result[3]);
            style.transition = style.webkitTransition = 'none';
            style.transform = style.webkitTransform = "translate3d(".concat(oldVal + distance[k], "px, 0, 0)");
          }

          if (result && result[7]) {
            var _oldVal = ~~(result && result[7]);

            style.transition = style.webkitTransition = 'none';
            style.transform = style.webkitTransform = "translate3d(0, ".concat(_oldVal + distance[k], "px, 0)");
          }
        }
      }
    } // Activate current item


    function activate() {
      var pos = count;
      var duration = options.duration + 'ms';
      var direction = options.direction;

      while (pos--) {
        var getTransform = function getTransform(pos) {
          if (direction === 'horizontal') {
            return "translate3d(".concat(transformed[pos], "px, 0, 0)");
          }

          return "translate3d(0, ".concat(transformed[pos], "px, 0)");
        };

        var style = items[pos].style;
        style.webkitTransition = style.transition = noTransition.indexOf(pos) > -1 ? 'none' : duration;
        style.webkitTransform = style.transfrom = getTransform(pos);
      }
    } // Events
    // init varialbles


    var _start = {};

    var _end = {};
    var timer = null;
    var delay = options.auto;

    function stop() {
      clearTimeout(timer);
      timer = null;
    }

    function nextSlide() {
      stop();
      prev = current;
      current++;
      setTranformed();
      activate();
    }

    function prevSlide() {
      stop();
      prev = current;
      current--;
      setTranformed(true);
      activate();
    }

    function go(index) {
      if (index < 0 || index > count - 1) return;
      stop();
      prev = current;
      setCurrent(index);
      execFn(activate);
    }

    function begin() {
      timer = setTimeout(nextSlide, delay);
    }

    var events = {
      start: function start(e) {
        var touch = e.changedTouches[0];
        _start.x = touch.pageX;
        _start.y = touch.pageY;
        _start.time = +new Date();
        var style = container.style;
        style.webkitTransition = style.transition = 'none';
      },
      move: function move(e) {// TODO
      },
      end: function end(e) {
        var touch = e.changedTouches[0];
        _end.x = touch.pageX;
        _end.y = touch.pageY;
        var dist = _end.y - _start.y;

        if (options.direction === 'horizontal') {
          dist = _end.x - _start.x;
        }

        if (Math.abs(dist) > options.threshold) {
          if (dist < 0) {
            prev = current;
            current++;
            setTranformed();
          } else {
            prev = current;
            current--;
            setTranformed(true);
          }

          activate();
        }
      },
      transitionEnd: function transitionEnd(e) {
        if (current === this.current) return;
        this.current = current;

        var _count = cloneItems ? 2 : count;

        var _current = current > 0 ? current : current + count;

        var _prev = prev > 0 ? prev : prev + count;

        options.transitionEnd && options.transitionEnd.call(e, _prev % _count, _current % _count, _count);
        e.preventDefault(); // 这里需要检查当前 swiper-item 中是否有 video 标签

        if (delay > 0 && timer === null && items[_current % _count] && !items[_current % _count].querySelector('video')) {
          begin();
        }
      }
    };

    function resize() {
      execFn(setup);
    } // bind events


    function bind() {
      if (!options.disableTouch) {
        container.addEventListener('touchstart', events.start);
        container.addEventListener('touchmove', events.move);
        container.addEventListener('touchend', events.end);
      }

      container.addEventListener('transitionEnd', noop);
      container.addEventListener('webkitTransitionEnd', events.transitionEnd);
      container.addEventListener('resize', resize);
    }

    function unbind() {
      container.removeEventListener('touchstart', events.start);
      container.removeEventListener('touchmove', events.move);
      container.removeEventListener('touchend', events.end);
      container.removeEventListener('transitionEnd', noop);
      container.removeEventListener('webkitTransitionEnd', events.transitionEnd);
      container.removeEventListener('resize', resize);
    }

    window.addEventListener('resize', resize);
    setup();
    bind();
    if (delay > 0 && items[0] && items[0].querySelector('video') === null) begin(); // Publish APIs

    var instance = {
      resize: setup,
      destroy: function destroy() {
        unbind();
        window.removeEventListener('resize', resize);
      },
      next: nextSlide,
      prev: prevSlide,
      go: go,
      activeIndex: function activeIndex() {
        var _current = current > 0 ? current : current + count;

        return _current % (cloneItems ? 2 : count);
      },
      begin: begin,
      stop: stop
    };
    var getCount = {
      get: function get() {
        return cloneItems ? 2 : count;
      }
    };
    Object.defineProperty(instance, 'count', getCount);
    Object.defineProperty(instance, 'length', getCount);
    return instance;
  }

  return Swiper;

})));
