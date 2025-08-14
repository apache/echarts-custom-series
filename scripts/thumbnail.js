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
const chalk = require('chalk');

/**
 * Generate a thumbnail for the custom series using SVG SSR.
 */
async function thumbnail(seriesName) {
  const seriesPath = path.join(__dirname, '..', 'custom-series', seriesName);
  const ssrPath = path.join(seriesPath, 'examples', 'ssr.js');

  // Create screenshots directory inside the series folder
  const screenshotsDir = path.join(seriesPath, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const outputPath = path.join(screenshotsDir, `${seriesName}.svg`);

  // Check if ssr.js exists
  if (!fs.existsSync(ssrPath)) {
    console.error(
      chalk.red(`ssr.js not found for ${seriesName} at ${ssrPath}`)
    );
    return;
  }

  const { spawn } = require('child_process');

  try {
    // Run the ssr.js file and capture its output
    const child = spawn('node', [ssrPath], {
      cwd: seriesPath,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let svgOutput = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      svgOutput += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(
          chalk.red(`ssr.js failed for ${seriesName} with code ${code}`)
        );
        if (errorOutput) {
          console.error(chalk.red(errorOutput));
        }
        return;
      }

      // Extract SVG content from output (in case there are other console logs)
      const svgMatch = svgOutput.match(/<svg[\s\S]*<\/svg>/);
      if (!svgMatch) {
        console.error(chalk.red(`No SVG output found for ${seriesName}`));
        return;
      }

      const svg = svgMatch[0];

      // Save the SVG to file
      fs.writeFileSync(outputPath, svg);
      console.log(
        chalk.green(`Thumbnail generated for ${seriesName}: ${outputPath}`)
      );
    });
  } catch (error) {
    console.error(chalk.red(`Error running ssr.js for ${seriesName}:`));
    console.error(chalk.red(error.stack));
  }
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
