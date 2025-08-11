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

const path = require('path');

// 从环境变量获取自定义系列名称和路径
const seriesName = process.env.CUSTOM_SERIES_NAME || 'customSeries';
const seriesPath = process.env.CUSTOM_SERIES_PATH || '.';

const licenseHeader = `/*
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

`;

const baseConfig = {
  input: path.join(seriesPath, 'lib/index.js'),
  plugins: []
};

const autoRegisterFooter = `
// Automatically register the custom series
if (typeof window !== 'undefined' && window.echarts) {
  window.echarts.use(window.${seriesName}CustomSeriesInstaller);
}
`;

const licensePlugin = {
  name: 'add-license',
  renderChunk(code) {
    return licenseHeader + code;
  },
};

const autoRegisterPlugin = {
  name: 'add-license-and-auto-register',
  renderChunk(code) {
    return licenseHeader + code + autoRegisterFooter;
  },
};

module.exports = [
  // UMD version - 需要手动注册
  {
    ...baseConfig,
    output: {
      file: path.join(seriesPath, 'dist/index.js'),
      format: 'umd',
      name: `${seriesName}CustomSeriesInstaller`,
      extend: true,
      globals: {
        window: 'window',
      },
    },
    plugins: [licensePlugin],
  },

  // Browser IIFE version - 自动注册
  {
    ...baseConfig,
    output: {
      file: path.join(seriesPath, 'dist/index.browser.js'),
      format: 'iife',
      name: `${seriesName}CustomSeriesInstaller`,
      extend: true,
      globals: {
        window: 'window',
      },
    },
    plugins: [autoRegisterPlugin],
  },

  // ES Module version - 需要手动注册
  {
    ...baseConfig,
    output: {
      file: path.join(seriesPath, 'dist/index.esm.js'),
      format: 'esm',
    },
    plugins: [licensePlugin],
  },

  // CommonJS version - 需要手动注册
  {
    ...baseConfig,
    output: {
      file: path.join(seriesPath, 'dist/index.cjs.js'),
      format: 'cjs',
    },
    plugins: [licensePlugin],
  }
];
