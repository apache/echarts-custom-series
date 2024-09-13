# $CUSTOM_SERIES_NAME$

`$CUSTOM_SERIES_NAME$` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to ...

![$CUSTOM_SERIES_NAME$](../../screenshots/$CUSTOM_SERIES_NAME$.svg)

## Usage

Import the custom series JavaScript file and ECharts, then use `echarts.use` to install it.

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./dist/index.js"></script>
<script>
  echarts.use(window.$CUSTOM_SERIES_NAME$CustomSeriesInstaller);
  const chart = echarts.init(...);
  // ...
</script>
```

Or, if using module bundler, install the package from npm and import it.

```bash
npm install @echarts/custom-$CUSTOM_SERIES_KEBAB_NAME$
```

```js
import echarts from 'echarts';
import $CUSTOM_SERIES_NAME$CustomSeriesInstaller from '@echarts/custom-$CUSTOM_SERIES_KEBAB_NAME$';

echarts.use($CUSTOM_SERIES_NAME$CustomSeriesInstaller);
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
