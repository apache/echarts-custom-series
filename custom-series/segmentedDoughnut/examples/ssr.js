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
const segmentedDoughnutInstaller = require('../dist/index.js');

echarts.use(segmentedDoughnutInstaller);

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

const option = {
  animation: false,
  tooltip: {
    show: false,
  },
  series: [
    {
      type: 'custom',
      renderItem: 'segmentedDoughnut',
      coordinateSystem: 'none',
      name: 'A',
      itemPayload: {
        center: ['25%', '50%'],
        radius: ['50%', '65%'],
        segmentCount: 8,
        label: {
          show: true,
          formatter: '{c}/{b}',
          fontSize: 35,
          color: '#555',
        },
      },
      data: [5],
      itemStyle: {
        // To override the default style
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    {
      type: 'custom',
      renderItem: 'segmentedDoughnut',
      coordinateSystem: 'none',
      name: 'B',
      itemPayload: {
        center: ['75%', '50%'],
        radius: ['50%', '65%'],
        segmentCount: 6,
        label: {
          show: true,
          formatter: '{d} 🎉',
          fontSize: 35,
          color: '#555',
        },
      },
      data: [6],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
  ],
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
