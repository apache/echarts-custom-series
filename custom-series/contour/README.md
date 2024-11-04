# contour

`contour` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to visualize where the data points are concentrated.

This is a contour custom series for Apache ECharts using [d3-contour](https://d3js.org/d3-contour).

![contour](../../screenshots/contour.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.contourCustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install d3 d3-contour @echarts/custom-contour
```

You need to import `d3` and `d3-contour` before importing calling `echarts.use(contourCustomSeriesInstaller);`.

```html
<script src="../node_modules/d3/dist/d3.js"></script>
<script src="../node_modules/d3-contour/dist/d3-contour.js"></script>
```

```js
import echarts from 'echarts';
import contourCustomSeriesInstaller from '@echarts/custom-contour';

echarts.use(contourCustomSeriesInstaller);
```

See [test](./test/index.html) for more details.

## API

### series.data

The data of the series is an array of arrays. Each sub-array represents the x and y value of a point. The contour is generated automatically based on the data.

```js
const data = [
  [12, 100],
  [20, 34]
];
```

### series.itemPayload

The `itemPayload` is an object that contains the following properties:

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `thresholds` | `number` | 8 | Bypassed to [d3-contour.thresholds](https://d3js.org/d3-contour/density#density_thresholds) |
| `bandwidth` | `number` | 20 | Bypassed to [d3-contour.bandwidth](https://d3js.org/d3-contour/density#density_bandwidth) |
| `itemStyle` | `object` | `{}` | The style of the contour. |
| `itemStyle.opacity` | `number | number[]` | `[0.3, 1]` | The opacity of the contour. If it's typed in `number`, all contours will have the same opacity. If it's typed in `number[]`, it should have a length at 2, representing the min and max opacity. In this case, the opacity of each contour will be set according to the interpolation of the array. |
| `itemStyle.color` | `string | string[]` | `null` | The color of the contour. If it's typed in `string`, all contours will have the same color. If it's typed in `string[]`, the color of each contour will be set according to the interpolation of the array. If it's `null`, series color will be used. |
| `itemStyle.lineStyle` | `object` | `{}` | The style of the contour line. |
| `itemStyle.lineStyle.color` | `string` | `null` | The color of the contour line. If it's `null`, the stroke will not be shown. |
| `itemStyle.lineStyle.width` | `number` | `1` | The width of the contour line. |
| `itemStyle.lineStyle.opacity` | `number` | `1` | The opacity of the contour line. |

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
