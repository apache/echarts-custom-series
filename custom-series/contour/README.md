# @echarts-x/custom-contour

`contour` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to visualize three-dimensional data—such as terrain elevation, temperature, or pollutant concentration—on a two-dimensional plane by connecting points of equal value (e.g., elevation or intensity) with contour lines.

![contour](https://raw.githubusercontent.com/apache/echarts-custom-series/main/custom-series/contour/screenshots/contour.svg)

[Source Code](https://github.com/apache/echarts-custom-series/tree/main/custom-series/contour)

## Usage

### Browser Environment

For browser usage, use the auto-registration version that automatically installs the custom series when loaded:

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./node_modules/@echarts-x/custom-contour/dist/index.auto.js"></script>
<script>
  // No need to call echarts.use(), automatically registered
  const chart = echarts.init(...);
  const option = {
    series: [{
      type: 'custom',
      renderItem: 'violin',
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
const contourInstaller = require('@echarts-x/custom-contour');
echarts.use(contourInstaller);
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
npm install @echarts-x/custom-contour
```

```js
import * as echarts from 'echarts';
import contourCustomSeriesInstaller from '@echarts-x/custom-contour';

echarts.use(contourCustomSeriesInstaller);
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

The data of the series is an array of arrays. Each sub-array represents ...

```js
const data = [];
```

### series.itemPayload

The `itemPayload` is an object that contains the following properties:

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |

### series.encode

To make sure the value axis and tooltip take the correct range, `encode` should be set as follows:

```js
encode: {
    x: 0,
    y: 1,
    tooltip: 2
}
```
