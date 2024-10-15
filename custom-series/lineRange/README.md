# lineRange

`lineRange` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to ...

![lineRange](../../screenshots/lineRange.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.lineRangeCustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install @echarts/custom-line-range
```

```js
import echarts from 'echarts';
import lineRangeCustomSeriesInstaller from '@echarts/custom-line-range';

echarts.use(lineRangeCustomSeriesInstaller);
```

See [test](./test/index.html) for more details.

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
