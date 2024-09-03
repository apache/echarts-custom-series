const fs = require('fs');
const path = require('path');

/**
 * Create a new custom series based on template
 */
function create(name) {
  // Copy the files under ./template to ./custom-series/<name>
  const templatePath = path.join(__dirname, './template');
  const seriesPath = path.join(__dirname, '../custom-series', name);
  if (fs.existsSync(seriesPath)) {
    console.error(`Custom series ${name} already exists`);
    return;
  }

  fs.mkdirSync(seriesPath);
  copyDirectory(templatePath, seriesPath);

  // Replace $$$ in package.json with <name>
  const packageJsonPath = path.join(seriesPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.name = `echarts-${name}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Run `npm install`
  console.log(`Installing dependencies for custom series ${name}...`);
  require('child_process').execSync(`npm install`, { cwd: seriesPath });

  console.log(`Custom series ${name} created successfully`);
  console.log(`Run "npm run build ${name}" to build the custom series`);
}

function copyDirectory(src, dest) {
  // Check if source directory exists
  if (!fs.existsSync(src)) {
    console.error(`Source directory "${src}" does not exist.`);
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

const names = process.argv.slice(2);
if (names.length === 0) {
  console.error(
    'Please specify the name of the custom series. For example: npm run create my-series'
  );
} else {
  names.forEach(create);
}
