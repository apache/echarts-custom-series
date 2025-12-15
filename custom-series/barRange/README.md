# @echarts-x/custom-bar-range

`barRange` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to display the range of data using bars.

![barRange](https://raw.githubusercontent.com/apache/echarts-custom-series/main/custom-series/barRange/screenshots/barRange.svg)

[Source Code](https://github.com/apache/echarts-custom-series/tree/main/custom-series/barRange)

## Usage

### Browser Environment

For browser usage, use the auto-registration version that automatically installs the custom series when loaded:

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./node_modules/@echarts-x/custom-bar-range/dist/bar-range.auto.js"></script>
<script>
  // No need to call echarts.use(), automatically registered
  const chart = echarts.init(...);
  const option = {
    series: [{
      type: 'custom',
      renderItem: 'barRange',
      // ...
    }]
  }
  chart.setOption(option);
</script>
```

See [examples](./examples) for more details.

### UMD (Universal Module Definition)

For environments that need manual registration or when using AMD/CommonJS loaders:

```js
// CommonJS
const echarts = require('echarts');
const barRangeInstaller = require('@echarts-x/custom-bar-range');
echarts.use(barRangeInstaller);
const chart = echarts.init(...);

const option = {
  series: [{
    type: 'custom',
    renderItem: '$CUSTOM_SERIES_NAME$',
    // ...
  }]
}
chart.setOption(option);
```

See [examples](./examples) for more details.

### ESM (ES Modules)

For modern module bundlers or native ES module environments:

```bash
npm install @echarts-x/custom-bar-range
```

```js
import * as echarts from 'echarts';
import barRangeCustomSeriesInstaller from '@echarts-x/custom-bar-range';

echarts.use(barRangeCustomSeriesInstaller);
const chart = echarts.init(...);

const option = {
  series: [{
    type: 'custom',
    renderItem: 'violin',
    // ...
  }]
}
chart.setOption(option);
```

See [examples](./examples) for more details.

## API

### series.data

The data of the series is an array of arrays. Each sub-array represents a bar.

```js
const data = [
  [0, 26.7, 32.5],
  [1, 25.3, 32.4],
];
```

The first element of the sub-array is the x value. The second and third elements are the lower and upper bounds of the bar.

### series.itemPayload

The `itemPayload` is an object that contains the following properties:

| Property       | Type              | Default | Description                               |
| -------------- | ----------------- | ------- | ----------------------------------------- |
| `barWidth`     | `number \| string` | `70%`   | The width of the bar.                     |
| `borderRadius` | `number`          | `0`     | The border radius of the bar.             |
| `margin`       | `number`          | `10`    | The margin between the bars and the text. |

### series.encode

To make sure the value axis and tooltip take the correct range, `encode` should be set as follows:

```js
encode: {
    x: 0,
    y: [1, 2],
    tooltip: [1, 2]
}
```
