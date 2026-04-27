require('ts-node').register({ transpileOnly: true });
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

tsConfigPaths.register({
    baseUrl: './',
    paths: tsConfig.compilerOptions.paths || {}
});

require('./test-classifier.js');
