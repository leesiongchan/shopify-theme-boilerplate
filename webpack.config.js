const BrowserSync = require("browser-sync");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const path = require("path");
const read = require("read-yaml");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const config = read.sync("config.yml");
const storeURL = config.development.store;
const themeID = config.development.theme_id;

module.exports = {
  mode: "production",
  entry: ["./src/scripts/index.ts", "./src/styles/index.css"],
  output: {
    filename: "assets/application.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    splitChunks: {
      // Shopify does not allow "~"
      automaticNameDelimiter: "-",
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["assets/application.js"],
    }),
    new MiniCssExtractPlugin({ filename: "assets/application.css" }),
    new CopyPlugin({
      patterns: [
        {
          from: "src",
          globOptions: {
            ignore: ["**/scripts/**", "**/styles/**"],
          },
        },
      ],
    }),
    new WebpackShellPluginNext({
      onWatchRun: {
        scripts: ["theme watch --notify=.themekitcache --dir=dist"],
        blocking: false,
        parallel: true,
      },
    }),
    new BrowserSyncPlugin(
      {
        https: true,
        port: 3000,
        proxy: `https://${storeURL}?preview_theme_id=${themeID}`,
        middleware: [
          function mw(req, res, next) {
            // Add url paramaters for Shopify theme preview.
            // ?_fd=0 prevents domain forwarding, ?pb=0 hides the Shopify preview bar
            const prefix = req.url.indexOf("?") > -1 ? "&" : "?";
            const queryStringComponents = ["_ab=0&_fd=0&_sc=1&pb=0"];
            req.url += prefix + queryStringComponents.join("&");
            next();
          },
        ],
        files: [
          {
            // .themekitcache is touched by theme-kit after uploaded to Shopify,
            // so the browser is ready to refresh.
            match: [".themekitcache"],
            fn() {
              BrowserSync.get("bs-webpack-plugin").reload();
            },
          },
        ],
        // Move snippet injection to </body>,
        // Shopify content_for_header causes injection to load in head and break scripts
        snippetOptions: {
          rule: {
            match: /<\/body>/i,
            fn(snippet, match) {
              return snippet + match;
            },
          },
        },
      },
      { reload: false }
    ),
  ],
};
