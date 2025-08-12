const echarts = require('echarts');
const violinInstaller = require('../dist/index.js');

echarts.use(violinInstaller);

const chart = echarts.init(null, null, {
  renderer: 'svg',
  ssr: true,
  width: 600,
  height: 400,
});

// Set up seeded random for consistent thumbnails
const seedrandom = require('seedrandom');
const myRandom = new seedrandom('echarts-random');
Math.random = function () {
  return myRandom();
};

const xData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dataSource = [['Day', 'value']];

for (let i = 0; i < xData.length; ++i) {
  const dataCount = 10 * Math.round(Math.random() * 5) + 5;
  for (let j = 0; j < dataCount; ++j) {
    const value = Math.tan(i) / 2 + 3 * Math.random() + 2;
    dataSource.push([xData[i], value]);
  }
}

const option = {
  animation: false,
  tooltip: {
    show: false,
  },
  xAxis: {
    type: 'category',
    data: xData,
    jitter: 100,
    jitterOverlap: false,
  },
  yAxis: {},
  dataset: {
    source: dataSource,
  },
  series: [
    {
      type: 'custom',
      renderItem: 'violin',
      colorBy: 'item',
      silent: true,
      itemPayload: {
        symbolSize: 4,
        areaOpacity: 0.6,
        bandWidthScale: 1.5,
      },
    },
    {
      type: 'scatter',
      encode: {
        x: 0,
        y: 1,
      },
      colorBy: 'item',
      silent: true,
      symbolSize: 6,
    },
  ],
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
