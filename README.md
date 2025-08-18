# echarts-custom-series

This repo provides some custom series for [Apache ECharts](https://github.com/apache/echarts). The minial supported version is Apache ECharts v6, which is not released yet.

## List of Custom Series

| | |
|-|-|
| `@echarts-x/custom-violin`<br> [doc](custom-series/violin) [npm](https://www.npmjs.com/package/@echarts-x/custom-violin) <br> ![violin](custom-series/violin/screenshots/violin.svg) | `@echarts-x/custom-contour`<br> [doc](custom-series/contour) [npm](https://www.npmjs.com/package/@echarts-x/custom-contour) <br> ![contour](custom-series/contour/screenshots/contour.svg) |
| `@echarts-x/custom-stage`<br> [doc](custom-series/stage) [npm](https://www.npmjs.com/package/@echarts-x/custom-stage) <br> ![stage](custom-series/stage/screenshots/stage.svg) | `@echarts-x/custom-segmented-doughnut`<br> [doc](custom-series/segmentedDoughnut) [npm](https://www.npmjs.com/package/@echarts-x/custom-segmented-doughnut) <br> ![segmentedDoughnut](custom-series/segmentedDoughnut/screenshots/segmentedDoughnut.svg) |
| `@echarts-x/custom-bar-range`<br> [doc](custom-series/barRange) [npm](https://www.npmjs.com/package/@echarts-x/custom-bar-range) <br> ![barRange](custom-series/barRange/screenshots/barRange.svg) | `@echarts-x/custom-line-range`<br> [doc](custom-series/lineRange) [npm](https://www.npmjs.com/package/@echarts-x/custom-line-range) <br> ![lineRange](custom-series/lineRange/screenshots/lineRange.svg) |

See the README in the above links about how to install and use.

## Develop

```bash
npm install
```

### Create A New Custom Series

```bash
npm run generate <series-name>
```

The generated files are in `custom-series/<series-name>`. Note that if there are multiple words in the series name, they should be in camel case like `npm run generate barRange`.

### Build

Each of the directories in `custom-series/` is a custom series.

#### Build All

```bash
npm run build
```

#### Build One

```bash
npm run build <series-name>
```

For example, to build `custom-series/violin`, run:

```bash
npm run build violin
```

### Generate Thumbnails

```bash
npm run thumbnail
# or
npm run thumbnail <series-name>
```
