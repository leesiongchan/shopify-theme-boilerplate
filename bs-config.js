const read = require("read-yaml");

const config = read.sync("config.yml");
const storeURL = config.development.store;
const themeID = config.development.theme_id;

module.exports = {
  files: [".themekitcache"],
  https: true,
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
  port: 3000,
  proxy: `https://${storeURL}?preview_theme_id=${themeID}`,
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
};
