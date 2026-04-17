import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rspack } from '@rspack/core';
import { validateDbJson } from './scripts/validate-db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

validateDbJson();

export default {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: {
    main: path.resolve(__dirname, 'src/main.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'assets/[name].[contenthash].js',
    chunkFilename: 'assets/[name].[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    publicPath: './',
    clean: true,
  },
  experiments: {
    css: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    parser: {
      'css/module': {
        namedExports: false,
      },
    },
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
              },
            },
          },
        ],
      },
      {
        test: /\.module\.css$/,
        type: 'css/module',
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      templateContent: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Coffee</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    }),
  ],
  devServer: {
    historyApiFallback: true,
    hot: true,
    static: {
      directory: path.resolve(__dirname, 'docs'),
    },
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
};
