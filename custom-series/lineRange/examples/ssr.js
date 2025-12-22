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
const lineRangeInstaller = require('../dist/line-range.js');

echarts.use(lineRangeInstaller);

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

const data = [
  [0, 26.7, 32.5],
  [1, 25.3, 32.4],
  [2, 24.6, 32.7],
  [3, 26.8, 35.8],
  [4, 26.2, 33.1],
  [5, 24.9, 31.4],
  [6, 25.3, 32.9],
];

option = {
  animation: false,
  tooltip: {
    show: false,
  },
  xAxis: {
    data: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    type: 'category',
  },
  yAxis: {
    type: 'value',
  },
  tooltip: {
    show: true,
  },
  legend: {
    top: 15,
  },
  series: [
    {
      type: 'custom',
      name: 'line',
      renderItem: 'lineRange',
      data,
      itemPayload: {
        areaStyle: {},
        // lineStyle: {
        //     width: 2
        // }
      },
      encode: {
        x: 0,
        y: [1, 2],
        tooltip: [1, 2],
      },
    },
    {
      type: 'line',
      name: 'line', // To use the same color as custom series
      data: data.map(function (item) {
        const ratio = Math.random() * 0.5 + 0.25;
        return item[1] * ratio + item[2] * (1 - ratio);
      }),
    },
  ],
};
chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
