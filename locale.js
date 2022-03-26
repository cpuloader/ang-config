const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');
const _ = require('lodash');

// This script converts YML files to JSON

// path for prod files
const sourceI18nPath = './i18n/';
const prodI18nPath = '../public/i18n/';

// files built by angular  here:
const distPath = './dist/ng-app/browser/';
const distPathServer = './dist/ng-app/server/';

let langs = ['en','ru'];

for (let lang of langs) {
  console.log('Loading source ymls... ');
  const sourcePath = path.join(sourceI18nPath, lang + '-yml');
  const sources = glob.sync(sourcePath + '/+([a-z0-9]).yml');
  if (!sources || !sources.length) {
    console.log('Error, no yml files!');
    return;
  }

  try {
    let mainJsonObj = {};
    for (let source of sources) {
      const jsonObj = yaml.safeLoad(fs.readFileSync(source, 'utf8'));
      mainJsonObj = _.extend(mainJsonObj, jsonObj);
    }
    let json = JSON.stringify(mainJsonObj);
    let finalFileName = lang + ".json";
    let p = path.join(sourceI18nPath, lang, finalFileName);
    console.log('Copying result to node local -> ', p);
    fs.writeFileSync(p, json, { encoding: 'utf-8' });
    p = path.join(prodI18nPath, finalFileName);
    console.log('Copying result to prod -> ', p);
    fs.writeFileSync(p, json, { encoding: 'utf-8' });
    console.log('Finished!');
  } catch (e) {
    console.log(e);
  }
}
