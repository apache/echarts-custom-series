# segmentedDoughnut

`segmentedDoughnut` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to show discrete progress of a task.

![segmentedDoughnut](../../screenshots/segmentedDoughnut.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.segmentedDoughnutCustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install @echarts/custom-segmented-doughnut
```

```js
import echarts from 'echarts';
import segmentedDoughnutCustomSeriesInstaller from '@echarts/custom-segmented-doughnut';

echarts.use(segmentedDoughnutCustomSeriesInstaller);
```

See [test](./test/index.html) for more details.

## API

### series.data

The data of the series is an array of arrays. Each sub-array represents a segment of the doughnut.

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

See [test](./test/index.html) for more details.
