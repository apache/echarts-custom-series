# echarts-custom-series

This repo provides some custom series for [Apache ECharts](https://github.com/apache/echarts). The minial supported version is Apache ECharts v6, which is not released yet.

## List of Custom Series

| | |
|-|-|
| [violin](custom-series/violin) <br> ![violin](custom-series/violin/screenshots/violin.svg) | [contour](custom-series/contour) <br> ![contour](custom-series/contour/screenshots/contour.svg) |
| [stage](custom-series/stage) <br> ![stage](custom-series/stage/screenshots/stage.svg) | [segmentedDoughnut](custom-series/segmentedDoughnut) <br> ![segmentedDoughnut](custom-series/segmentedDoughnut/screenshots/segmentedDoughnut.svg) |
| [barRange](custom-series/barRange) <br> ![barRange](custom-series/barRange/screenshots/barRange.svg) | [lineRange](custom-series/lineRange) <br> ![lineRange](custom-series/lineRange/screenshots/lineRange.svg) |

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
