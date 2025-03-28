const path = require('path');

module.exports = [
  {
    // Конфигурация для сборки продакшн-бандла
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'tette.bundle.js',
      library: 'GalchemyCore',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  },
  {
    // Конфигурация для сборки девелопмент-бандла (если нужно)
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'galchemy.dev.js',
      library: 'GalchemyCore',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  }
];
