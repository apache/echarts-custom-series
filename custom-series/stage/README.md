# @echarts-x/custom-stage

`stage` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to display the data with various stages, like sleeping stages.

![stage](https://raw.githubusercontent.com/apache/echarts-custom-series/main/custom-series/stage/screenshots/stage.svg)

[Source Code](https://github.com/apache/echarts-custom-series/tree/main/custom-series/stage)

## Usage

### Browser Environment

For browser usage, use the auto-registration version that automatically installs the custom series when loaded:

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./node_modules/@echarts-x/custom-stage/dist/stage.auto.js"></script>
<script>
  // No need to call echarts.use(), automatically registered
  const chart = echarts.init(...);
  const option = {
    series: [{
      type: 'custom',
      renderItem: 'stage',
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
const stageInstaller = require('@echarts-x/custom-stage');
echarts.use(stageInstaller);
const chart = echarts.init(...);

const option = {
  series: [{
    type: 'custom',
    renderItem: 'stage',
    // ...
  }]
}
chart.setOption(option);
```

See [examples](./examples) for more details.

### ESM (ES Modules)

For modern module bundlers or native ES module environments:

```bash
npm install @echarts-x/custom-stage
```

```js
import * as echarts from 'echarts';
import stageCustomSeriesInstaller from '@echarts-x/custom-stage';

echarts.use(stageCustomSeriesInstaller);
const chart = echarts.init(...);

const option = {
  series: [{
    type: 'custom',
    renderItem: 'stage',
    // ...
  }]
}
chart.setOption(option);
```

See [examples](./examples) for more details.

## API

### series.data

The data of the series is an array of arrays. Each sub-array represents a scatter point.

```js
const data = [
  [new Date('2024-09-07 06:12'), new Date('2024-09-07 06:12'), 'Awake']
];
```

The first element of the sub-array is the starting value, and the second is ending value. The third element is the stage name. The data with the same x value will be grouped into a stage.

### series.itemPayload

The `itemPayload` is an object that contains the following properties:

| Property         | Type     | Default | Description |
| ---------------- | -------- | ------- | ----------- |
| `itemStyle`      | `object` | `{}` | The style of the stage. |
| `itemStyle.borderRadius` | `number` | `8` | The border radius of the stage. |
| `itemStyle.verticalMargin` | `number` | `10` | The vertical margin of the bars. |
| `itemStyle.minHorizontalSize` | `number` | `3` | The minimum width of the bars. |
| `itemStyle.envelope` | `object` | `{}` | The envelope of the stage. |
| `itemStyle.envelope.show` | `boolean` | `true` | Whether to show the envelope. |
| `itemStyle.envelope.color` | `string` | `#888` | The fill color of the envelope. |
| `itemStyle.envelope.opacity` | `number` | `0.25` | The opacity of the envelope. |
| `itemStyle.envelope.externalRadius` | `number` | `8` | The border radius of the envelope outside. |
| `itemStyle.axisLabel` | `object` | `{}` | The style of the axis label. |
| `itemStyle.axisLabel.formatter` | `Function` | null | The formatter of the axis label. Parameters are `(stageName: string, stageIndex: number)`. |
| `itemStyle.axisLabel.color` | `string` | `#8A8A8A` | The color of the axis label. |
