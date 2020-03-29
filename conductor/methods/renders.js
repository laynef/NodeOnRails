const { renderServerSide } = require('./serverside');

const webpackHotReloads = (res, application) => {

    const normalizeAssets = (assets) => {
        return Array.isArray(assets) ? assets : [assets];
    };

    if (res.locals.webpackStats && res.locals.webpackStats.toJson && res.locals.webpackStats.toJson().assetsByChunkName) {
        const assetsByChunkName = res.locals.webpackStats.toJson().assetsByChunkName;

        const assets = normalizeAssets(assetsByChunkName[application]);

        return assets.filter(e => !!e).reduce((acc, item) => {
            if (item.endsWith('.js')) acc.js.push(item);
            if (item.endsWith('.css')) acc.css.push(item);
            return acc;
        }, { js: [], css: [] });
    } else {
        return { js: [], css: [] };
    }
};

const globalRenders = (name, req, res, customs) => {
    const { camelCase } = require('lodash');

    const meta = global.meta;
    meta.keywords = Array.isArray(meta.keywords) ? meta.keywords.join(',') : meta.keywords;

    const nameArray = name.split('/');
    const filenameArray = nameArray.slice(1);
    const pageName = filenameArray.pop();

    let files = null;
    if (pageName === 'index') files = 'index';
    else if (customs && customs.statusCode >= 400) files = `errors${customs.statusCode}`;
    else files = camelCase(filenameArray.map(e => e.replace(RegExp(':', 'ig'), '')).join(' '));

    const hostName = `${req.protocol}://${req.get('host')}`;

    return Object.assign({}, meta, {
        name: pageName.split('').map((e, i) => i === 0 ? e.toUpperCase() : e.toLowerCase()).join(''),
        csrf: req.session.cookie.token,
        host: `${hostName}${req.url}`,
        url: req.url,
        jsFiles: webpackHotReloads(res, files).js,
        cssFiles: webpackHotReloads(res, files).css,
        filePath: files,
        environment: process.env.NODE_ENV,
        hostName,
    }, customs);
};

const makeHash = (hashLength) => {
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let temp = '';
    for (let i = 0; i < hashLength; i++) {
        temp += characters[Math.floor(Math.random() * characters.length)];
    }
    return temp;
};

module.exports = {

    globalRenders,
    makeHash,

    render: (pageName, customObject = {}, requestMethod = () => ({})) => async (req, res) => {
        try {
            const { serverSide } = renderServerSide(global.settings);
            const storage = await serverSide(pageName, req);
            const makeRequest = requestMethod(req, res);
            const requestObject = typeof makeRequest === 'object' ? makeRequest : {}
            res.status(customObject && customObject.statusCode || 200).render(pageName, globalRenders(pageName, req, res, Object.assign({}, customObject, requestObject, storage)));
        } catch (e) {
            return e;
        }
    },

    renderError: async (req, res, pageName, customObject = {}, requestMethod = () => ({})) => {
        try {
            const { serverSide } = renderServerSide(global.settings);
            const storage = await serverSide(`pages/${pageName}/${errorCode}`, req);
            const makeRequest = requestMethod(req, res);
            const requestObject = typeof makeRequest === 'object' ? makeRequest : {}
            res.status(customObject && customObject.statusCode || 400).render(pageName, globalRenders(pageName, req, res, Object.assign({}, customObject, requestObject, storage)));
        } catch (e) {
            return e;
        }
    },

};
