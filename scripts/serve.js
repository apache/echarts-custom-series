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
const { exec } = require('child_process');
const chokidar = require('chokidar');
const chalk = require('chalk');

/**
 * Start a local server to run the test cases.
 */
function buildAndServe() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      chalk.red(
        'No custom series name provided. Run `npm run serve <series-name>` to serve a custom series.'
      )
    );
    return;
  }

  console.log('Building...');
  build().then(() => {
    startServer();
  });
}

function build() {
  const args = process.argv.slice(2);
  return new Promise((resolve) => {
    exec(`npm run build ${args[0]}`, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Build error: ${error}`));
        // End the process
        process.exit(1);
      }
      console.log(`Build output: ${stdout}`);
      if (stderr) {
        console.error(`Build stderr: ${stderr}`);
      }
      resolve();
    });
  });
}

function startServer() {
  const args = process.argv.slice(2);
  const seriesPath = path.join(__dirname, '../custom-series', args[0]);
  if (!fs.existsSync(seriesPath)) {
    console.error(chalk.red(`Custom series ${args[0]} does not exist`));
    return;
  }

  const port = 8087;
  const serverProcess = exec(`http-server ${seriesPath} -p ${port}`);

  // Add file watcher
  const watcher = chokidar.watch(path.join(seriesPath, 'src'), {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });
  watcher.on('change', (path) => {
    console.log(chalk.gray(`File ${path} has been changed. Rebuilding...`));
    build();
  });

  serverProcess.stdout.on('data', (data) => {
    if (data.includes('Available on:')) {
      const open =
        process.platform === 'darwin'
          ? 'open'
          : process.platform === 'win32'
          ? 'start'
          : 'xdg-open';
      const url = `http://localhost:${port}/examples/index.html`;
      exec(`${open} ${url}`, (error) => {
        if (error) {
          console.error(chalk.red(`Failed to open browser: ${error}`));
        }
      });
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(chalk.red(data.toString()));
  });

  serverProcess.on('close', (code) => {
    console.log(chalk.gray(`http-server process exited with code ${code}`));
  });
}

buildAndServe();
