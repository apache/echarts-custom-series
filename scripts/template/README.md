# $CUSTOM_SERIES_NAME$

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
