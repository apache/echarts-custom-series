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

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

function toFileBaseName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/**
 * Install dependencies before build if needed.
 * If no `node_modules` directory, run `npm install`
 *
 * @param {string} dirName directory name under ./custom-series/
 */
function beforeBuild(dirName) {
  const seriesPath = path.join(__dirname, '../custom-series', dirName);
  const nodeModulesPath = path.join(seriesPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(
      chalk.gray(`Installing dependencies for custom series ${dirName}...`)
    );
    execSync(`npm install`, { cwd: seriesPath });
  }
}

/**
 * Build one custom series
 *
 * @param {string} dirName directory name under ./custom-series/
 */
function buildCustomSeries(dirName) {
  const seriesPath = path.join(__dirname, '../custom-series', dirName);
  if (fs.statSync(seriesPath).isDirectory() === false) {
    console.log(chalk.yellow(`${dirName} is not a directory. Ignored.`));
    return;
  }
  if (!fs.existsSync(seriesPath)) {
    console.error(chalk.red(`Custom series ${dirName} does not exist`));
    return;
  }

  beforeBuild(dirName);

  console.log(`Building custom series ${dirName}...`);

  compileTypeScript(seriesPath, dirName);
  bundleWithRollup(seriesPath, dirName);
}

function compileTypeScript(seriesPath, dirName) {
  const tscPath = path.join(__dirname, '../node_modules/.bin/tsc');
  // Remove dir of lib
  if (fs.existsSync(path.join(seriesPath, 'lib'))) {
    fs.rmSync(path.join(seriesPath, 'lib'), {
      recursive: true,
      force: true,
    });
  }

  try {
    execSync(
      `${tscPath} ${seriesPath}/src/index.ts \
        --outDir ${seriesPath}/lib \
        --target ES5 \
        --noImplicitAny \
        --noImplicitThis \
        --strictBindCallApply \
        --removeComments true \
        --sourceMap \
        --moduleResolution node \
        --esModuleInterop \
        --importHelpers \
        --pretty \
        --ignoreDeprecations 5.0 \
        --module es2015`
    );
  } catch (e) {
    // There may be some error compiling ECharts, which can be ignored
    // as long as `lib/index.js` exists
  }
  if (!fs.existsSync(path.join(seriesPath, 'lib/index.js'))) {
    console.error(
      chalk.red(`Error compiling TypeScript for custom series ${dirName}:`)
    );
    console.error(e);
    process.exit(1);
  }
  console.log(`Compiled TypeScript for custom series ${dirName}`);
}

function bundleWithRollup(seriesPath, dirName) {
  const rollupPath = path.join(__dirname, '../node_modules/.bin/rollup');
  const configPath = path.join(__dirname, 'rollup.config.js');
  const distPath = path.join(seriesPath, 'dist');
  const fileBaseName = toFileBaseName(dirName);

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  try {
    // 通过环境变量传递自定义系列名称和路径
    const env = {
      ...process.env,
      CUSTOM_SERIES_NAME: dirName,
      CUSTOM_SERIES_PATH: seriesPath,
      CUSTOM_SERIES_FILE_BASENAME: fileBaseName,
    };

    execSync(`${rollupPath} -c ${configPath}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      env,
      cwd: seriesPath,
    });

    console.log(`Rollup bundling and minification completed for ${dirName}`);

    // Create fixed type definition file in dist directory
    const distTypesPath = path.join(seriesPath, 'dist', `${fileBaseName}.d.ts`);
    const fixedTypeDefinition = `// Tricky: use1 and use2 are incompatible.
import type {use as use1} from 'echarts/core';
import type {use as use2} from 'echarts';
declare const _default: Parameters<typeof use1>[0] & Parameters<typeof use2>[0];
export default _default;
`;
    fs.writeFileSync(distTypesPath, fixedTypeDefinition, 'utf8');
    console.log(`Created fixed type definitions for ${dirName}`);

    // Check if the output files were created
    const expectedFiles = [
      `${fileBaseName}.js`,
      `${fileBaseName}.min.js`,
      `${fileBaseName}.auto.js`,
      `${fileBaseName}.auto.min.js`,
      `${fileBaseName}.esm.mjs`,
      `${fileBaseName}.esm.min.mjs`,
      `${fileBaseName}.d.ts`,
    ];

    for (const file of expectedFiles) {
      if (!fs.existsSync(path.join(seriesPath, 'dist', file))) {
        console.warn(
          chalk.yellow(`Warning: ${file} not created for ${dirName}`)
        );
      }
    }
  } catch (e) {
    console.error(`Error bundling custom series ${dirName}:`);
    console.error(e.message);
    if (e.stdout) console.error('Rollup stdout:', e.stdout.toString());
    if (e.stderr) console.error('Rollup stderr:', e.stderr.toString());
  }
}

/**
 * `npm run build` to build all
 * `npm run build <series-name>` to build one custom series
 */
function build() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // Build all custom series
    const dirs = fs.readdirSync(path.join(__dirname, '../custom-series'));
    dirs.forEach((name, index) => {
      console.log(chalk.cyan(`Running ${name}: (${index + 1}/${dirs.length})`));
      buildCustomSeries(name);
      console.log(`---------------\n`);
    });
  } else {
    // Build custom series from args
    args.forEach(buildCustomSeries);
  }
  console.log(chalk.green('Build successfully.'));
}

build();
