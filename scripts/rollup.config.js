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
const fs = require('fs');

const seriesName = process.env.CUSTOM_SERIES_NAME || 'customSeries';
const seriesPath = process.env.CUSTOM_SERIES_PATH || '.';

// Check if series has its own rollup config
let seriesRollupConfig = {};
const seriesConfigPath = path.join(seriesPath, 'rollup.config.js');
if (fs.existsSync(seriesConfigPath)) {
  seriesRollupConfig = require(seriesConfigPath);
}

function toFileBaseName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

const fileBaseName =
  process.env.CUSTOM_SERIES_FILE_BASENAME || toFileBaseName(seriesName);

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
  plugins: [],
  external: seriesRollupConfig.external || [],
};

// Helper function to get all external dependencies for UMD
function getUMDExternals() {
  const allExternals = [...(baseConfig.external || []), 'echarts'];
  return allExternals;
}

// Helper function to get all globals for UMD
function getUMDGlobals() {
  const allExternals = getUMDExternals();
  const globals = {};

  // Map each external to its global variable name
  allExternals.forEach((ext) => {
    // Default: use the same name as the package name
    globals[ext] = ext;
  });

  // Override with series-specific globals from config if provided
  if (seriesRollupConfig.output && seriesRollupConfig.output.globals) {
    Object.assign(globals, seriesRollupConfig.output.globals);
  }

  return globals;
}

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

const terserPlugin = {
  name: 'terser-minify',
  async renderChunk(code, chunk, options) {
    if (options.file && options.file.includes('.min.')) {
      // 动态导入 terser 避免初始化问题
      const { minify } = require('terser');
      const result = await minify(code, {
        compress: {
          ecma: 3,
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
        mangle: true,
        format: {
          comments: 'all',
          ecma: 3,
        },
        sourceMap: true,
      });
      return {
        code: result.code,
        map: result.map,
      };
    }
    return null;
  },
};

module.exports = [
  // UMD version
  {
    ...baseConfig,
    external: getUMDExternals(),
    output: {
      file: path.join(seriesPath, `dist/${fileBaseName}.js`),
      format: 'umd',
      name: `${seriesName}CustomSeriesInstaller`,
      extend: true,
      globals: getUMDGlobals(),
    },
    plugins: [licensePlugin],
  },

  // UMD minified version
  {
    ...baseConfig,
    external: getUMDExternals(),
    output: {
      file: path.join(seriesPath, `dist/${fileBaseName}.min.js`),
      format: 'umd',
      name: `${seriesName}CustomSeriesInstaller`,
      extend: true,
      globals: getUMDGlobals(),
      sourcemap: true,
    },
    plugins: [licensePlugin, terserPlugin],
  },

  // Browser version - automatically registers (IIFE with all dependencies)
  {
    ...baseConfig,
    external: getUMDExternals(),
    output: {
      file: path.join(seriesPath, `dist/${fileBaseName}.auto.js`),
      format: 'iife',
      name: `${seriesName}CustomSeriesInstaller`,
      extend: true,
      globals: getUMDGlobals(),
    },
    plugins: [autoRegisterPlugin],
  },

  // Browser minified version - automatically registers
  {
    ...baseConfig,
    external: getUMDExternals(),
    output: {
      file: path.join(seriesPath, `dist/${fileBaseName}.auto.min.js`),
      format: 'iife',
      name: `${seriesName}CustomSeriesInstaller`,
      extend: true,
      globals: getUMDGlobals(),
      sourcemap: true,
    },
    plugins: [autoRegisterPlugin, terserPlugin],
  },

  // ES Module version
  {
    ...baseConfig,
    external: getUMDExternals(),
    output: {
      file: path.join(seriesPath, `dist/${fileBaseName}.esm.mjs`),
      format: 'esm',
    },
    plugins: [licensePlugin],
  },

  // ES Module minified version
  {
    ...baseConfig,
    external: getUMDExternals(),
    output: {
      file: path.join(seriesPath, `dist/${fileBaseName}.esm.min.mjs`),
      format: 'esm',
      sourcemap: true,
    },
    plugins: [licensePlugin, terserPlugin],
  },
];
