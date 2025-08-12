# violin

`violin` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to display the distribution of data using violin plots.

![violin](https://raw.githubusercontent.com/apache/echarts-custom-series/dev/custom-series/violin/screenshots/violin.svg)

## Usage

### Browser Environment

For browser usage, use the auto-registration version that automatically installs the custom series when loaded:

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./node_modules/@echarts-x/custom-violin/dist/index.auto.js"></script>
<script>
  // No need to call echarts.use(), automatically registered
  const chart = echarts.init(...);
  // ...
</script>
```

### UMD (Universal Module Definition)

For environments that need manual registration or when using AMD/CommonJS loaders:

```js
// CommonJS
const echarts = require('echarts');
const violinInstaller = require('@echarts-x/custom-violin');
echarts.use(violinInstaller);
const chart = echarts.init(...);
// ...

// AMD
require(['echarts', '@echarts-x/custom-violin'], function(echarts, violinInstaller) {
  echarts.use(violinInstaller);
});
```

### ESM (ES Modules)

For modern module bundlers or native ES module environments:

```bash
npm install @echarts-x/custom-violin
```

```js
import * as echarts from 'echarts';
import violinCustomSeriesInstaller from '@echarts-x/custom-violin/dist/index.esm.js';

echarts.use(violinCustomSeriesInstaller);
```

See [test](./test) for more details.

## API

### series.data

The data of the series is an array of arrays. Each sub-array represents a scatter point.

```js
const data = [
  [0, 26.7],
  [1, 25.3],
];
```

The first element of the sub-array is the x value. The second element is the y value. The data with the same x value will be grouped into a violin.

### series.itemPayload

The `itemPayload` is an object that contains the following properties:

| Property         | Type     | Default | Description                                                                                       |
| ---------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `symbolSize`     | `number` | `10`    | The size of the symbol.                                                                           |
| `areaOpacity`    | `number` | `0.5`   | The opacity of the area.                                                                          |
| `bandWidthScale` | `number` | `1`     | The scale of the amplitude of the violin.                                                         |
| `binCount`       | `number` | `100`   | The number of bins for the violin plot. The more bins, the more detailed the violin plot will be. |
