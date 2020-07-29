const { JSDOM } = require('jsdom');
const blockTools = require('@sanity/block-tools').default;
const sanitizeHTML = require('./sanitizeHTML');
const { blockContentType } = require('../schemas/schema');

// we have to filter out missing/invalid content as it will break on migration
const missingImagesBlacklist = [
  'https://10clouds.com/wp-content/uploads/2019/05/programisci-1024x683.jpg',
  'https://10clouds.com/wp-content/uploads/2019/12/blockchain.png',
  'https://10clouds.com/wp-content/uploads/2019/01/ux-trends-2019.png',
  'https://10clouds.com/wp-content/uploads/2017/11/Screen-Shot-2017-11-21-at-15.08.35-1024x387.png',
  'http://new.10clouds.com/new/wp-content/uploads/2016/07/Chłopaki2-740x493-1.jpg',
  'http://new.10clouds.com/new/wp-content/uploads/2016/06/photo-1438550005440-ca2422768342.jpeg',
  'http://new.10clouds.com/new/wp-content/uploads/2016/06/photo-1438550005440-ca2422768342.jpeg',
  'http://new.10clouds.com/new/wp-content/uploads/2016/05/swappedjob.png',
  'http://new.10clouds.com/new/wp-content/uploads/2016/03/Untitled-design-1.png',
  'http://new.10clouds.com/new/wp-content/uploads/2015/09/Untitled-design-4.png',
  'http://new.10clouds.com/new/wp-content/uploads/2016/03/Untitled-design-1.png',
  'http://new.10clouds.com/new/wp-content/uploads/2016/06/silence.jpg',
];

function htmlToBlocks(html, options) {
  if (!html) {
    return [];
  }
  const errors = { isUsingCdnImages: false, hasBlacklistedImage: false };

  const blocks = blockTools.htmlToBlocks(sanitizeHTML(html), blockContentType, {
    parseHtml: (htmlContent) => new JSDOM(htmlContent).window.document,
    rules: [
      {
        deserialize(el, next, block) {
          // Special case for code blocks (wrapped in pre and code tag)
          if (el.tagName.toLowerCase() !== 'pre') {
            return undefined;
          }
          const code = el.children[0];
          let text = '';
          if (code) {
            const childNodes = code && code.tagName.toLowerCase() === 'code' ? code.childNodes : el.childNodes;
            childNodes.forEach((node) => {
              text += node.textContent;
            });
          } else {
            text = el.textContent;
          }
          if (!text) {
            return undefined;
          }
          return block({
            children: [],
            _type: 'code',
            text: text,
          });
        },
      },
      {
        deserialize(el, next, block) {
          if (el.tagName === 'IMG') {
            const imageUrl = el.getAttribute('src');

            if (imageUrl.includes('googleusercontent')) {
              // dont try to download blocks from google cdn as they'll be blocked
              errors.isUsingCdnImages = true;
              return undefined;
            }
            if (missingImagesBlacklist.some((url) => url === imageUrl)) {
              errors.hasBlacklistedImage = true;
              return undefined;
            }

            return block({
              _type: 'enhancedImage',
              children: [],
              _sanityAsset: `image@${imageUrl.replace(/^\/\//, 'https://')}`,
            });
          }

          if (
            el.tagName.toLowerCase() === 'p' &&
            el.childNodes.length === 1 &&
            el.childNodes.tagName &&
            el.childNodes[0].tagName.toLowerCase() === 'img'
          ) {
            const imageUrl = el.childNodes[0].getAttribute('src');

            if (imageUrl.includes('googleusercontent')) {
              // dont try to download blocks from google cdn as they'll be blocked
              errors.isUsingCdnImages = true;
              return undefined;
            }

            if (missingImagesBlacklist.some((url) => url === imageUrl)) {
              errors.hasBlacklistedImage = true;
              return undefined;
            }

            return block({
              _type: 'enhancedImage',
              children: [],
              _sanityAsset: `image@${imageUrl.replace(/^\/\//, 'https://')}`,
            });
          }
          return undefined;
        },
      },
    ],
  });
  return { blocks, errors };
}

module.exports = { parseBody: (bodyHTML) => htmlToBlocks(bodyHTML), missingImagesBlacklist };
