const sanitizeHtmlLib = require('sanitize-html');

const html = '<div style="font-weight:bold; padding:4px 0; text-transform:uppercase;">Test</div>';

console.log('With default:', sanitizeHtmlLib(html, {
    allowedTags: ['div'],
    allowedAttributes: { '*': ['style'] }
}));

console.log('With allowAllStyles:', sanitizeHtmlLib(html, {
    allowedTags: ['div'],
    allowedAttributes: { '*': ['style'] },
    allowedStyles: {
        '*': {
            // Match any CSS property and value using regex
            '.*': [/.*/]
        }
    }
}));
