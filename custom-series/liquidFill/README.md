# @echarts-x/custom-liquid-fill

`liquidFill` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to represent percentage values, capacity levels, or progress in a visually appealing way.

![liquidFill](https://raw.githubusercontent.com/apache/echarts-custom-series/main/custom-series/liquidFill/screenshots/liquidFill.svg)

[Source Code](https://github.com/apache/echarts-custom-series/tree/main/custom-series/liquidFill)

## Usage

### Browser Environment

For browser usage, use the auto-registration version that automatically installs the custom series when loaded:

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./node_modules/@echarts-x/custom-liquid-fill/dist/liquid-fill.auto.js"></script>
<script>
  // No need to call echarts.use(), automatically registered
  const chart = echarts.init(...);
  const option = {
    series: [{
      type: 'custom',
      renderItem: 'liquidFill',
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
const liquidFillInstaller = require('@echarts-x/custom-liquid-fill');
echarts.use(liquidFillInstaller);
const chart = echarts.init(...);

const option = {
  series: [{
    type: 'custom',
    renderItem: 'liquidFill',
    // ...
  }]
}
chart.setOption(option);
```

See [examples](./examples) for more details.

### ESM (ES Modules)

For modern module bundlers or native ES module environments:

```bash
npm install @echarts-x/custom-liquid-fill
```

```js
import * as echarts from 'echarts';
import liquidFillCustomSeriesInstaller from '@echarts-x/custom-liquid-fill';

echarts.use(liquidFillCustomSeriesInstaller);
const chart = echarts.init(...);

const option = {
  series: [{
    type: 'custom',
    renderItem: 'liquidFill',
    // ...
  }]
}
chart.setOption(option);
```

See [examples](./examples) for more details.

## API

### series.data

The data of the series is an array of numbers. Each value represents the liquid fill level for one item, typically in the range from `0` (empty) to `1` (full).

```js
const data = [0.6, 0.5, 0.4, 0.3];
```

### series.itemPayload

The `itemPayload` is an object that contains the following properties:

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `center` | `Array<string \| number>` | `['50%', '50%']` | Circle center. Percentage values are relative to the viewport; numbers are pixel offsets. |
| `radius` | `string \| number` | `'50%'` | Outer radius of the liquid container. Percentages are based on the smaller viewport dimension. |
| `amplitude` | `number` | `≈ min(width, height) * 8 / 500` | Wave height in pixels. Larger values create taller crests and deeper troughs. |
| `waveLength` | `string \| number` | `innerRadius * 1.6` | Horizontal length of one full wave cycle. Percentages are applied to the container diameter. |
| `phase` | `number \| 'auto'` | `'auto'` | Initial wave phase in radians. `'auto'` staggers each wave according to its data index. |
| `period` | `number \| 'auto' \| ((value: number, index: number) => number)` | `'auto'` | Base animation period in milliseconds. Functions receive the data value and index. |
| `direction` | `'right' \| 'left' \| 'none'` | `'right'` | Travel direction of the wave animation. Use `'none'` to keep waves stationary. |
| `waveAnimation` | `boolean` | `true` | Enables horizontal wave motion. Set `false` for a static surface. |
| `animationDuration` | `number` | Derived from `period` | Overrides the computed loop duration (ms) for the wave keyframe animation. Must be positive to take effect. |
| `animationEasing` | `string` | Inherits default easing | Easing name passed to the keyframe animation (e.g., `'linear'`, `'quadraticInOut'`). |
| `labelInsideColor` | `string` | Matches wave color | Text fill used when the label is clipped inside the liquid. |
| `outline` | `object` | See below | Controls spacing between the container outline and the liquid surface. |
| `backgroundStyle` | `object` | See below | Visual style of the inner background disk. |
| `itemStyle` | `object` | See below | Visual style of each liquid wave. |

#### `outline`

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `show` | `boolean` | `true` | Whether to reserve space for an outline ring. When `false`, the liquid fills the full radius. |
| `borderDistance` | `number` | `8` | Gap between the outline and the liquid surface (px). |
| `itemStyle.borderWidth` | `number` | `8` | Width of the outline ring that is subtracted when computing the inner radius. |

> Additional outline style fields (`borderColor`, `shadowBlur`, `shadowColor`) are accepted for compatibility but are currently not applied by the renderer.

#### `backgroundStyle`

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `color` | `string` | `'#E3F7FF'` | Fill color of the background disk behind the liquid. |

#### `itemStyle`

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `opacity` | `number` | `0.95` | Opacity applied to each wave path. |
| `shadowBlur` | `number` | `undefined` | Shadow blur radius for the wave path (px). |
| `shadowColor` | `string` | `undefined` | Shadow color for the wave path. |
