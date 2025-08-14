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
 * Create a new custom series based on template
 */
function create(name) {
  // Copy the files under ./template to ./custom-series/<name>
  const templatePath = path.join(__dirname, './template');
  const seriesPath = path.join(__dirname, '../custom-series', name);
  if (fs.existsSync(seriesPath)) {
    console.error(chalk.red(`Custom series ${name} already exists`));
    return;
  }

  // Check if the name is in camelCase, ignore if is not
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    console.error(
      chalk.red(
        `Custom series name must be in camelCase. For example: mySeries`
      )
    );
    process.exit(1);
  }

  fs.mkdirSync(seriesPath);
  copyDirectory(templatePath, seriesPath);

  // Replace `$CUSTOM_SERIES_NAME$` in all files under seriesPath with <name>
  const kebabCaseName = toKebabCase(name);
  replaceCustomSeriesName(seriesPath, name, kebabCaseName);

  const packageJsonPath = path.join(seriesPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.name = `@echarts/custom-${kebabCaseName}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Run `npm install`
  console.log(
    chalk.gray(`Installing dependencies for custom series ${name}...`)
  );
  require('child_process').execSync(`npm install`, { cwd: seriesPath });

  console.log(chalk.green(`Custom series ${name} created successfully.\n`));
}

/**
 * Recursively replace the custom series name in the file
 */
function replaceCustomSeriesName(filePath, name, kebabCaseName) {
  if (fs.statSync(filePath).isDirectory()) {
    const items = fs.readdirSync(filePath);
    items.forEach((item) => {
      replaceCustomSeriesName(path.join(filePath, item), name, kebabCaseName);
    });
  } else {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content.replace(/\$CUSTOM_SERIES_NAME\$/g, name);
    newContent = newContent.replace(
      /\$CUSTOM_SERIES_KEBAB_NAME\$/g,
      kebabCaseName
    );
    const pascalCase = name.charAt(0).toUpperCase() + name.slice(1);
    newContent = newContent.replace(
      /\$CUSTOM_SERIES_PASCAL_NAME\$/g,
      pascalCase
    );
    fs.writeFileSync(filePath, newContent);
  }
}

function copyDirectory(src, dest) {
  // Check if source directory exists
  if (!fs.existsSync(src)) {
    console.error(chalk.red(`Source directory "${src}" does not exist.`));
    return;
  }

  // Create the destination directory if it does not exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read all files and directories in the source directory
  const items = fs.readdirSync(src);

  // Iterate over each item in the directory
  items.forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      // If the item is a directory, recursively copy its contents
      copyDirectory(srcPath, destPath);
    } else {
      // If the item is a file, copy it to the destination
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Convert from camelCase to kebab-case
 */
function toKebabCase(name) {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}

const names = process.argv.slice(2);
if (names.length === 0) {
  console.error(
    chalk.red(
      'Please specify the name of the custom series. For example: npm run create mySeries'
    )
  );
} else {
  names.forEach(create);
}

console.log(
  chalk.yellow(
    `Note: before the official release of ECharts v6, you need to clone the "apache/echarts" repo and build it locally, and then use "npm run link echarts" to link the local echarts to the custom series`
  )
);
console.log(
  chalk.cyan(
    `Run "npm run serve <custom-series-name>" to start the local development server`
  )
);
