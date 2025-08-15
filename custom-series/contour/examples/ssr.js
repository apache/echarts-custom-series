/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const echarts = require('echarts');
const contourInstaller = require('../dist/index.js');

echarts.use(contourInstaller);

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

const data = [];
const cnt = 300;
for (let i = 0; i < cnt; i++) {
  data.push([
    (Math.sin((i / cnt) * Math.PI * 2) + Math.random() * 0.2 - 0.4) *
      100 *
      Math.random(),
    (Math.cos((i / cnt) * Math.PI * 2) + Math.random() * 0.2 - 0.4) *
      100 *
      Math.random(),
    Math.random() * 10000,
  ]);
}

option = {
  animation: false,
  tooltip: {
    show: false,
  },
  xAxis: {},
  yAxis: {},
  series: [
    {
      type: 'custom',
      renderItem: 'contour',
      data,
      itemPayload: {
        itemStyle: {
          color: ['#5470c6', '#91cc75', '#fac858', '#ee6666'],
        },
        lineStyle: {
          opacity: 0.5,
        },
        bandwidth: 30,
      },
      encode: {
        x: 0,
        y: 1,
        tooltip: 2,
      },
      name: 'data',
      // }, {
      //     type: 'scatter',
      //     data,
      //     name: 'data'
    },
  ],
  visualMap: {
    seriesIndex: 1,
    min: 0,
    max: 10000,
    inRange: {
      symbolSize: [3, 5],
    },
    show: false,
  },
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
