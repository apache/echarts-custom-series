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
const stageInstaller = require('../dist/stage.js');

echarts.use(stageInstaller);

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
  [new Date('2024-09-07 06:12'), new Date('2024-09-07 06:12'), 'Awake'],
  [new Date('2024-09-07 06:15'), new Date('2024-09-07 06:18'), 'Awake'],
  [new Date('2024-09-07 08:59'), new Date('2024-09-07 09:00'), 'Awake'],
  [new Date('2024-09-07 05:45'), new Date('2024-09-07 06:12'), 'REM'],
  [new Date('2024-09-07 07:37'), new Date('2024-09-07 07:56'), 'REM'],
  [new Date('2024-09-07 08:56'), new Date('2024-09-07 08:59'), 'REM'],
  [new Date('2024-09-07 09:08'), new Date('2024-09-07 09:29'), 'REM'],
  [new Date('2024-09-07 05:45'), new Date('2024-09-07 06:12'), 'REM'],
  [new Date('2024-09-07 03:12'), new Date('2024-09-07 03:27'), 'Core'],
  [new Date('2024-09-07 04:02'), new Date('2024-09-07 04:36'), 'Core'],
  [new Date('2024-09-07 04:40'), new Date('2024-09-07 04:48'), 'Core'],
  [new Date('2024-09-07 04:57'), new Date('2024-09-07 05:45'), 'Core'],
  [new Date('2024-09-07 06:12'), new Date('2024-09-07 06:15'), 'Core'],
  [new Date('2024-09-07 06:18'), new Date('2024-09-07 07:37'), 'Core'],
  [new Date('2024-09-07 07:56'), new Date('2024-09-07 08:56'), 'Core'],
  [new Date('2024-09-07 09:00'), new Date('2024-09-07 09:08'), 'Core'],
  [new Date('2024-09-07 09:29'), new Date('2024-09-07 10:41'), 'Core'],
  [new Date('2024-09-07 03:27'), new Date('2024-09-07 04:02'), 'Deep'],
  [new Date('2024-09-07 04:36'), new Date('2024-09-07 04:40'), 'Deep'],
  [new Date('2024-09-07 04:48'), new Date('2024-09-07 04:57'), 'Deep'],
];

function formatTime(time) {
  const minutes = time.getMinutes();
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return time.getHours() + ':' + minStr;
}

const option = {
  animation: false,
  tooltip: {
    show: false,
  },
  tooltip: {
    show: true,
    valueFormatter: (params) => {
      return formatTime(params[0]) + ' - ' + formatTime(params[1]);
    },
  },
  xAxis: {
    type: 'time',
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        opacity: 0.8,
      },
    },
    min: (value) => {
      // Max whole hour that is no biggeer than value
      return Math.floor(value.min / (60 * 60 * 1000)) * 60 * 60 * 1000;
    },
    max: (value) => {
      // Min whole hour that is no smaller than value
      return Math.ceil(value.max / (60 * 60 * 1000)) * 60 * 60 * 1000;
    },
    axisLabel: {
      align: 'left',
      color: '#c6c6c6',
    },
  },
  yAxis: {
    type: 'category',
    data: ['Deep', 'Core', 'REM', 'Awake'],
    splitLine: {
      show: true,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: '#ccc',
      },
    },
  },
  dataset: {
    source: data,
  },
  series: {
    type: 'custom',
    renderItem: 'stage',
    colorBy: 'data',
    itemPayload: {
      envelope: {},
    },
    encode: {
      x: [0, 1],
      y: 2,
      tooltip: [0, 1],
    },
  },
  visualMap: {
    show: false,
    type: 'piecewise',
    categories: [0, 1, 2, 3],
    dimension: 2,
    inRange: {
      color: {
        0: '#35349D',
        1: '#3478F6',
        2: '#59AAE1',
        3: '#EF8872',
      },
    },
    seriesIndex: 0,
    outOfRange: {
      color: '#61E6E1',
    },
  },
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
