const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = function extend(webpackConfig) {
  webpackConfig.plugins.push(new NodePolyfillPlugin());

  webpackConfig.resolve["fallback"] = {
    dns: require.resolve("@i2labs/dns"),
    fs: require.resolve("browserify-fs"),
    net: require.resolve("net-browserify"),
    tls: require.resolve("tls-browserify"),
    child_process: require.resolve("./child_process_shim")
  };

  return webpackConfig;
}