# echarts-custom-series

This repo provides some custom series for [Apache ECharts](https://github.com/apache/echarts). The minial supported version is Apache ECharts v6, which is not released yet.

## List of Custom Series

TODO

## Create A New Custom Series

```bash
npm run create <series-name>
```

The generated files are in `custom-series/<series-name>`.

## Build

Each of the directories in `custom-series/` is a custom series.

### Build All

```bash
npm run build
```

### Build One

```bash
npm run build <series-name>
```

For example, to build `custom-series/violin`, run:

```bash
npm run build violin
```
