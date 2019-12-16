# Swiper

> swiper for mobile in minimal.

## Usage

```html
<div class="swiper">
  <div class="swiper-item">
    0
  </div>
  <div class="swiper-item">
    1
  </div>
  <div class="swiper-item">
    2
  </div>
  <div class="swiper-item">
    3
  </div>
  <div class="swiper-item">
    4
  </div>
</div>

<script src='//unpkg.com/@wangdahoo/swiper/swiper.min.css'></script>
<script src='//unpkg.com/@wangdahoo/swiper/swiper.min.js'></script>

<script>
  window.swiper = new Swiper(document.querySelector('.swiper'), {
    auto: false,
    itemClass: '.swiper-item',
    disableTouch: false,
    direction: 'horizontal',
    transitionEnd: function (prev, current, length) {
      console.log(prev, current, length)
    }
  })
</script>
```

## More

- [Examples](https://wangdahoo.github.io/swiper)
