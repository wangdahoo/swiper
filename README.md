# Swiper

> swiper for mobile in minimal.

## Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Swiper in Minimal</title>

  <!-- swiper.css -->
  <link href="https://unpkg.com/@wangdahoo/swiper@0.1.1/dist/swiper.min.css" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }

    .swiper-item {
      background: orange;
      color: #fff;
      font-size: 100px;
      line-height: 300px;
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- swiper contaienr & items, need set width and height for container -->
  <div class="swiper" style="width: 100%; height: 300px;">
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

  <!-- swiper.js -->
  <script src="https://unpkg.com/@wangdahoo/swiper@0.1.1/dist/swiper.min.js"></script>
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
</body>
</html>
```

## More

- [Examples](https://wangdahoo.github.io/swiper)
