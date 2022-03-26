const fs = require('fs');
var glob = require('glob');

// This script takes angular DEV files and puts to target directories.

// paths
const sourceDevHtmlPath = './source-templates/dev/';
const targetHtmlPath = '../app/views/angular/';

console.log('Find and copy index.html to target dir...');
var htmlfile = glob.sync(sourceDevHtmlPath + 'index.html')[0];
htmlfile = htmlfile.slice(sourceDevHtmlPath.length, htmlfile.length);
console.log(sourceDevHtmlPath + htmlfile, ' -> ', targetHtmlPath + htmlfile);
fs.copyFileSync(sourceDevHtmlPath + htmlfile, targetHtmlPath + htmlfile);

console.log('Finished!'); // you maybe should 'touch tmp/restart.txt' if your index.html changed!
