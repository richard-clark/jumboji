const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
console.log(isProduction);

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, "docs"),
    compress: true,
    port: 9000,
    hot: true,
    historyApiFallback: {
      index: "/"
    }
  },

  entry: "./src/index.js",

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }, {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["es2015", "stage-0"],
            plugins: ["transform-regenerator"]
          }
        }
      }, {
        test: /\.(json|svg)$/,
        loader: "file-loader"
      }, {
        test: /worker\.js$/,
        // include: paths.appSrc,
        use: [
          { loader: 'worker-loader' },
          { loader: 'babel-loader',
            options: {
              presets: ["es2015", "stage-0"],
              plugins: ["transform-regenerator"]
            }
          }
        ]
      },
    ]
  },

  output: {
    filename: "bundle.js",
    path: __dirname + "/docs",
    publicPath: isProduction ? "/jumboji/" : "/"
  },

  plugins: [
    new FaviconsWebpackPlugin("./favicon.png"),
    new HtmlWebpackPlugin({
      baseUrl: isProduction ? "/jumboji/" : "/",
      title: "Jumboji 🕺🏽"
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
