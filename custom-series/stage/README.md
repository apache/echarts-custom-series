# stage

`stage` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to display the data with various stages, like sleeping stages.

![stage](../../screenshots/stage.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.stageCustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install @echarts/custom-stage
```

```js
import echarts from 'echarts';
import stageCustomSeriesInstaller from '@echarts/custom-stage';

echarts.use(stageCustomSeriesInstaller);
```

See [test](./test/index.html) for more details.

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
