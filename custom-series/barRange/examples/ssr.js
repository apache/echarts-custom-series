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
const barRangeInstaller = require('../dist/index.js');

echarts.use(barRangeInstaller);

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
  series: {
    type: 'custom',
    renderItem: 'barRange',
    data,
    itemPayload: {
      barWidth: 10,
      borderRadius: 5,
    },
    encode: {
      x: 0,
      y: [1, 2],
      tooltip: [1, 2],
    },
  },
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
