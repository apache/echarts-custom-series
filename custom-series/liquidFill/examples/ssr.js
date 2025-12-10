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
const liquidFillInstaller = require('../dist/liquid-fill.js');

echarts.use(liquidFillInstaller);

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
const bgColor = '#E3F7FF';
const option = {
  color: ['#294D99', '#156ACF', '#1598ED', '#45BDFF'],
  series: {
    type: 'custom',
    renderItem: 'liquidFill',
    coordinateSystem: 'none',
    colorBy: 'item',
    data: [0.6, 0.5, 0.4, 0.3],
    label: {
      show: true,
      position: ['50%', '40%'],
      formatter: function () {
        return 'ECharts\nLiquid Fill';
      },
      fontSize: 50,
      fontWeight: 'bold',
      color: '#294D99',
      align: 'center',
      verticalAlign: 'middle',
    },
    itemPayload: {
      radius: '80%',
      center: ['50%', '50%'],
      outline: {
        show: false,
      },
      backgroundStyle: {
        borderColor: '#156ACF',
        borderWidth: 1,
        color: bgColor,
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowBlur: 20,
      },
      itemStyle: {
        opacity: 0.75,
        shadowBlur: 18,
        shadowColor: 'rgba(0, 0, 0, 0.25)',
      },
      labelInsideColor: '#fff',
      waveAnimation: true,
      amplitude: 18,
      waveLength: '60%',
    },
  },
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
