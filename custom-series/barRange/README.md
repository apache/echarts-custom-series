# barRange

`barRange` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to display the range of data using bars.

![barRange](../../screenshots/barRange.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.barRangeCustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install @echarts/custom-bar-range
```

```js
import echarts from 'echarts';
import barRangeCustomSeriesInstaller from '@echarts/custom-bar-range';

echarts.use(barRangeCustomSeriesInstaller);
```

See [test](./test/index.html) for more details.

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

| Property       | Type     | Default | Description                               |
| -------------- | -------- | ------- | ----------------------------------------- | --------------------- |
| `barWidth`     | `number`  | string` | `70%`                                     | The width of the bar. |
| `borderRadius` | `number` | `0`     | The border radius of the bar.             |
| `margin`       | `number` | `10`    | The margin between the bars and the text. |

### series.encode

To make sure the value axis and tooltip take the correct range, `encode` should be set as follows:

```js
encode: {
    x: 0,
    y: [1, 2],
    tooltip: [1, 2]
}
```

See [test](./test/index.html) for more details.
