# violin

`violin` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to display the distribution of data using violin plots.

![violin](../../screenshots/violin.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.violinCustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install @echarts/custom-violin
```

```js
import echarts from 'echarts';
import violinCustomSeriesInstaller from '@echarts/custom-violin';

echarts.use(violinCustomSeriesInstaller);
```

See [test](./test/index.html) for more details.

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
