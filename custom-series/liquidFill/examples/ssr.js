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
const liquidFillInstaller = require('../dist/index.js');

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

// Sample data generation - customize this for your specific chart type
const sampleData = [];
// TODO: Generate appropriate sample data for liquidFill

const option = {
  animation: false,
  tooltip: {
    show: false,
  },
  // TODO: Configure axes and other options specific to liquidFill
  series: [
    {
      type: 'custom',
      renderItem: 'liquidFill',
      data: sampleData,
      silent: true,
      itemPayload: {
        // TODO: Add specific itemPayload properties for liquidFill
      },
    },
  ],
};

chart.setOption(option);

const svg = chart.renderToSVGString();
console.log(svg);

chart.dispose();
