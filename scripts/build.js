const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    console.log(`Installing dependencies for custom series ${dirName}...`);
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
  if (!fs.existsSync(seriesPath)) {
    console.error(`Custom series ${dirName} does not exist`);
    return;
  }

  beforeBuild(dirName);

  console.log(`Building custom series ${dirName}...`);

  // Execute `tsc index.ts` to build custom series
  const tscPath = path.join(__dirname, '../node_modules/.bin/tsc');
  execSync(
    `${tscPath} ${seriesPath}/src/index.ts \
        --outDir ${seriesPath}/dist \
        --target ES3 \
        --noImplicitAny \
        --noImplicitThis \
        --strictBindCallApply \
        --removeComments false \
        --sourceMap \
        --moduleResolution node \
        --esModuleInterop \
        --declaration \
        --declarationMap false \
        --importHelpers \
        --pretty \
        --ignoreDeprecations 5.0`
  );
}

/**
 * `npm run build` to build all
 * `npm run build <series-name>` to build one custom series
 */
function build() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // Build all custom series
    fs.readdirSync(path.join(__dirname, '../custom-series')).forEach(
      buildCustomSeries
    );
  } else {
    // Build custom series from args
    args.forEach(buildCustomSeries);
  }
  console.log('Build successfully.');
}

build();
