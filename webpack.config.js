const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { AngularCompilerPlugin } = require("@ngtools/webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const WebpackAssetsManifest = require('webpack-assets-manifest')

const projectRoot = __dirname;
const appSrcPath = path.resolve(projectRoot, 'src');
const appFullPath = path.resolve(appSrcPath, 'app');
const contentBase = path.resolve(projectRoot, 'app/assets');

module.exports  = {
    mode: 'development',
    context: projectRoot,
    entry: {
        polyfills: './src/polyfills.ts',
        vendor: './src/vendor.ts',
        main: './src/main.ts',
        styles: './src/styles.scss'
    },
    resolve: {
        extensions: [".ts", ".js", ".scss", ".css"],
        modules: [
          "node_modules"
        ],
        alias: {
            '~': projectRoot
        },
    },
    module: {
      rules: [
        {
          test: /(\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
          loader: "@ngtools/webpack"
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.scss$/,
          use: [
               'to-string-loader',
               {
                 loader: 'css-loader',
                 options: {
                   sourceMap: true
                 }
               },
               {
                 loader: 'sass-loader',
                 options: {
                   sourceMap: true
                 }
               }
          ],
          include: appFullPath
        },
        {
          test: /\.scss$/,
          exclude: appFullPath,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: 'development'
              },
            },
            'css-loader',
            'sass-loader',
          ]
        },
        {
          test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
          parser: { system: true },
        }
      ]
    },
    plugins:[
        //new CleanWebpackPlugin(), // nothing to clean here
        new AngularCompilerPlugin({
          mainPath: path.join(appSrcPath, 'main'),
          tsConfigPath: path.join(projectRoot, "tsconfig.app.json"),
          entryModule: path.join(appFullPath, "app.module#AppModule"),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false
        })/*,
        new WebpackAssetsManifest({
          integrity: false,
          entrypoints: true,
          writeToDisk: false,
          publicPath: 'http://localhost:4200/'
        })*/
    ],
    output: {
        path: path.join(projectRoot, "dist-dev"), // for CleanWebpackPlugin only, but dont touch this
        pathinfo: true,
        publicPath:  'http://localhost:4200/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js',
        crossOriginLoading: false
    },
    devServer: {
        contentBase: contentBase,
        port: 4200,
        hot: true,
        historyApiFallback:  true,
        publicPath: 'http://localhost:4200/',
        headers: {
          'Access-Control-Allow-Origin':  '*'
        }
    },
    /*ts: {
        configFileName : 'tsconfig.webpack.json'
    },*/
    devtool: 'cheap-module-eval-source-map'
}
