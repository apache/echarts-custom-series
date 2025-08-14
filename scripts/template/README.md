# @echarts-x/custom-$CUSTOM_SERIES_NAME$

`$CUSTOM_SERIES_NAME$` is a custom series for [Apache ECharts](https://github.com/apache/echarts). It's typically used to ...

![$CUSTOM_SERIES_NAME$](https://raw.githubusercontent.com/apache/echarts-custom-series/main/custom-series/$CUSTOM_SERIES_KEBAB_NAME$/screenshots/$CUSTOM_SERIES_NAME$.svg)

[Source Code](https://github.com/apache/echarts-custom-series/tree/main/custom-series/$CUSTOM_SERIES_NAME$)

## Usage

### Browser Environment

For browser usage, use the auto-registration version that automatically installs the custom series when loaded:

```html
<script src="./node_modules/echarts/dist/echarts.js"></script>
<script src="./node_modules/@echarts-x/custom-$CUSTOM_SERIES_KEBAB_NAME$/dist/index.auto.js"></script>
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
const $CUSTOM_SERIES_NAME$Installer = require('@echarts-x/custom-$CUSTOM_SERIES_KEBAB_NAME$');
echarts.use($CUSTOM_SERIES_NAME$Installer);
const chart = echarts.init(...);
// ...

// AMD
require(['echarts', '@echarts-x/custom-$CUSTOM_SERIES_KEBAB_NAME$'], function(echarts, $CUSTOM_SERIES_NAME$Installer) {
  echarts.use($CUSTOM_SERIES_NAME$Installer);
});
```

### ESM (ES Modules)

For modern module bundlers or native ES module environments:

```bash
npm install @echarts-x/custom-$CUSTOM_SERIES_KEBAB_NAME$
```

```js
import * as echarts from 'echarts';
import $CUSTOM_SERIES_NAME$CustomSeriesInstaller from '@echarts-x/custom-$CUSTOM_SERIES_KEBAB_NAME$';

echarts.use($CUSTOM_SERIES_NAME$CustomSeriesInstaller);
```

See [examples](./examples) for more details.

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

### series.encode

To make sure the value axis and tooltip take the correct range, `encode` should be set as follows:

```js
encode: {
    x: 0,
    y: 1,
    tooltip: 2
}
```
