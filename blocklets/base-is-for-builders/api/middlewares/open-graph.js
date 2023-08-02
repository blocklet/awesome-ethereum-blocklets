const { readFileSync } = require('fs');
const path = require('path');
const LRUCache = require('lru-cache');
const { Path } = require('path-parser');
const Mustache = require('mustache');
const logger = require('../libs/logger');
// const env = require('../libs/env');

const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5,
});

const openGraph = ({ staticDir, fileName = 'index.html', useCache = true } = {}) => {
  return async (req, res, next) => {
    const reqPath = req.path;
    const basePathCheck = new Path('/:pathname</>');
    const baseCheckResult = basePathCheck.partialTest(reqPath);
    const isOpenGraph =
      (req.method === 'GET' || req.method === 'HEAD') && (baseCheckResult?.pathname || ['/'].includes(reqPath));

    if (isOpenGraph) {
      try {
        const template = readFileSync(path.join(staticDir || '', fileName || '')).toString();
        const url = req.originalUrl;
        let html = useCache && cache.get(url);

        if (!html) {
          const og = {
            // title: env.appName,
            // description: env.appDescription,
            embed: '/api/embed',
          };

          html = Mustache.render(template, {
            ogTitle: og?.title || 'Base is for builders',
            ogDescription:
              og?.description || 'A blocklet that lets you mint "Base is for builders" NFT on Base Mainnet.',
            ogImage: og?.image || 'https://images.mirror-media.xyz/publication-images/Zm87s2zqqYkuGh3zZ_U4d.gif',
            ogEmbed: `${og?.embed}`,
          });
          cache.set(url, html);
        }

        res.send(html);
      } catch (error) {
        logger.error('open graph error: ', error);
        next();
      }
    } else {
      next();
    }
  };
};

module.exports = openGraph;
