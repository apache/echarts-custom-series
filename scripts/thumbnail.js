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
const echarts = require('echarts');
const chalk = require('chalk');
/**
 * Generate a thumbnail for the custom series using SVG SSR.
 */
function thumbnail(seriesName) {
  const seriesPath = path.join(__dirname, '..', 'custom-series', seriesName);
  const testPath = path.join(seriesPath, 'test', 'index.html');
  const outputPath = path.join('./screenshots', `${seriesName}.svg`);

  // Install the custom series
  const customSeries = require(`../custom-series/${seriesName}`);
  echarts.use(customSeries);

  let chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width: 600,
    height: 400,
  });

  // Load the js code from the content of the last <script></script>
  // in 'test/index.html'
  const html = fs.readFileSync(testPath, 'utf8');
  const lastScriptStartIndex = html.lastIndexOf('<script>');
  const lastScriptEndIndex = html.lastIndexOf('</script>');
  const jsCode = html.substring(lastScriptStartIndex + 8, lastScriptEndIndex);

  // Ignore the lines containing `echarts.use`, `echarts.init` and `.setOption`
  // TODO: Not considered the case where there are multiple `chart.setOption`
  // calls
  const lines = jsCode.split('\n');
  const code = lines
    .filter(
      (line) =>
        !line.includes('echarts.use') &&
        !line.includes('echarts.init') &&
        !line.includes('chart.setOption')
    )
    .join('\n');

  // Run the code
  try {
    eval(code);
    // To make sure text is readable in dark mode
    option.backgroundColor = '#fff';
    chart.setOption(option);
  } catch (error) {
    console.error(chalk.red(error.stack));
    return;
  }

  const svg = chart.renderToSVGString();

  chart.dispose();
  chart = null;
  option = null;

  // Save the SVG to file
  fs.writeFileSync(outputPath, svg);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  // Generate thumbnails for all custom series
  const dirs = fs.readdirSync(path.join(__dirname, '..', 'custom-series'));
  dirs.forEach((name) => {
    if (
      fs
        .statSync(path.join(__dirname, '..', 'custom-series', name))
        .isDirectory()
    ) {
      console.log(chalk.cyan(`Generating thumbnail for ${name}.`));
      thumbnail(name);
    }
  });
} else {
  // Generate thumbnail for the specified custom series
  args.forEach((name) => {
    console.log(`Generating thumbnail for ${name}.`);
    thumbnail(name);
  });
}
