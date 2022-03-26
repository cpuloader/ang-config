const fs = require('fs');
var glob = require('glob');

// This script takes angular PROD files and puts to target directories.

// path for prod files
const prodJsPath = '../public/';
const prodCssPath = '../public/';
const prodHtmlPath = '../app/views/angular/';

// files built by angular  here:
const distPath = './dist/ng-app/browser/';
const distPathServer = './dist/ng-app/server/';


console.log('Deleting old files...');
var oldJsFiles = glob.sync(prodJsPath + '*.js');
for (let file of oldJsFiles) {
  fs.unlinkSync(file);
}
var oldHtmlFiles = glob.sync(prodHtmlPath + '*.html');
for (let file of oldHtmlFiles) {
  fs.unlinkSync(file);
}
var oldCssFiles = glob.sync(prodCssPath + '*.css');
for (let file of oldCssFiles) {
  fs.unlinkSync(file);
}
/*var oldJsFiles2 = glob.sync(prodJsServerPath + '*.*');
for (let file of oldJsFiles2) {
  fs.unlinkSync(file);
}*/

console.log('Collect and copy generated files:');
var main_es5 = glob.sync(distPath + 'main-es5\.+([a-z0-9]).js')[0];
main_es5 = main_es5.slice(distPath.length, main_es5.length);
console.log(distPath + main_es5, ' -> ', prodJsPath + main_es5);
fs.copyFileSync(distPath + main_es5, prodJsPath + main_es5);
console.log('main_es5', main_es5);

var main_es2015 = glob.sync(distPath + 'main-es2015\.+([a-z0-9]).js')[0];
main_es2015 = main_es2015.slice(distPath.length, main_es2015.length);
console.log(distPath + main_es2015, ' -> ', prodJsPath + main_es2015);
fs.copyFileSync(distPath + main_es2015, prodJsPath + main_es2015);
console.log('main_es2015', main_es2015);

var runtime_es5 = glob.sync(distPath + 'runtime-es5\.+([a-z0-9]).js')[0];
runtime_es5 = runtime_es5.slice(distPath.length, runtime_es5.length);
console.log(distPath + runtime_es5, ' -> ', prodJsPath + runtime_es5);
fs.copyFileSync(distPath + runtime_es5, prodJsPath + runtime_es5);
console.log('runtime_es5', runtime_es5);

var runtime_es2015 = glob.sync(distPath + 'runtime-es2015\.+([a-z0-9]).js')[0];
runtime_es2015 = runtime_es2015.slice(distPath.length, runtime_es2015.length);
console.log(distPath + runtime_es2015, ' -> ', prodJsPath + runtime_es2015);
fs.copyFileSync(distPath + runtime_es2015, prodJsPath + runtime_es2015);
console.log('runtime_es2015', runtime_es2015);

var polyfills_es5 = glob.sync(distPath + 'polyfills-es5\.+([a-z0-9]).js')[0];
polyfills_es5 = polyfills_es5.slice(distPath.length, polyfills_es5.length);
console.log(distPath + polyfills_es5, ' -> ', prodJsPath + polyfills_es5);
fs.copyFileSync(distPath + polyfills_es5, prodJsPath + polyfills_es5);
console.log('polyfills_es5', polyfills_es5);

var polyfills_es2015 = glob.sync(distPath + 'polyfills-es2015\.+([a-z0-9]).js')[0];
polyfills_es2015 = polyfills_es2015.slice(distPath.length, polyfills_es2015.length);
console.log(distPath + polyfills_es2015, ' -> ', prodJsPath + polyfills_es2015);
fs.copyFileSync(distPath + polyfills_es2015, prodJsPath + polyfills_es2015);
console.log('polyfills_es2015', polyfills_es2015);

var styles = glob.sync(distPath + 'styles\.+([a-z0-9]).css')[0];
styles = styles.slice(distPath.length, styles.length);
console.log(distPath + styles, ' -> ', prodCssPath + styles);
fs.copyFileSync(distPath + styles, prodCssPath + styles);
console.log('styles', styles);

console.log('Find and copy index.html to prod...');
var htmlfile = glob.sync(distPath + 'index.html')[0];
htmlfile = htmlfile.slice(distPath.length, htmlfile.length);
console.log(distPath + htmlfile, ' -> ', prodHtmlPath + htmlfile);
fs.copyFileSync(distPath + htmlfile, prodHtmlPath + htmlfile);

console.log('Search for lazy modules...');
var lazyFiles = glob.sync(distPath + '+([0-9]|common)-es+([0-9])\.+([a-z0-9])\.js');
for (let lfile of lazyFiles) {
  lfile = lfile.slice(distPath.length, lfile.length);
  console.log(distPath + lfile, ' -> ', prodJsPath + lfile);
  fs.copyFileSync(distPath + lfile, prodJsPath + lfile);
  console.log('Copy lazy to prod: ', lfile);
}
console.log('Finished!'); // you maybe should 'touch tmp/restart.txt' if your index.html changed!
