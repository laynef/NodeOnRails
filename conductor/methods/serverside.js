const fs = require('fs');
const path = require('path');


const handleServerSide = (settings) => {
    const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
    require('babel-register')(babelrc);
    return require('../babel')(settings)(settings);
}

const getVueServerSideStorage = async (req) => {
    const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
    require('babel-register')(babelrc);
    const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
    const createStore = require(path.join(assets, 'state', 'store'));
    try {
        let state = await global.redis.getAsync(req.session.id);
        state = !!state ? JSON.parse(state) : {};
        return createStore(state);
    } catch(e) {
        return createStore({});
    }
};

const setServerSideCache = (req, data) => {
    global.redis.set(req.session.id, JSON.stringify(data));
};

const getReactServerSideStorage = async (req) => {
    const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
    require('babel-register')(babelrc);
    const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
    const createStore = require(path.join(assets, 'redux', 'store'));

    try {
        let state = await global.redis.getAsync(req.session.id);
        state = !!state ? JSON.parse(state) : {};
        return createStore(state);
    } catch(e) {
        return createStore({});
    }
};

const getReactServerSideStorageState = async (req) => {
    const store = await getReactServerSideStorage(req);
    return store.getState();
};

const getJsServerSideStorage = async (req) => {
    const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
    require('babel-register')(babelrc);
    const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
    const createStore = require(path.join(assets, 'storage', 'store'));
    try {
        let state = await global.redis.getAsync(req.session.id);
        state = !!state ? JSON.parse(state) : {};
        return createStore(state);
    } catch(e) {
        return createStore({});
    }
};

const serverSideOptions = {

        js: {

            getServerSideStorage: getJsServerSideStorage,
            setServerSideStorage: setServerSideCache,

            serverSide: async (pageName, req) => {
                const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
                require('babel-register')(babelrc);
                try {
                    let storage = await getJsServerSideStorage(req);
                    return { serversideStorage: JSON.stringify(storage) };
                } catch (e) {
                    const store = require(path.join(assets, 'storage', 'store'))({});
                    return { serversideStorage: JSON.stringify(store) };
                }
            },

            getFreshStore: (req) => {
                const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
                require('babel-register')(babelrc);
                const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
                const store = require(path.join(assets, 'storage', 'store'))({});
                setServerSideCache(req, store);
                return storage;
            },
        },

        jsx: {

            getServerSideStorage: getReactServerSideStorageState,
            setServerSideStorage: setServerSideCache,

            serverSide: async (pageName, req) => {
                const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
                require('babel-register')(babelrc);
                const assets = path.join(settings.context, 'app', 'assets', settings.jsType);

                const componentArray = pageName.split('/');
                componentArray.pop();
                const componentPath = componentArray.join('/') + '/component';

                const Application = require(path.join(assets, componentPath));
                const getServersideString = handleServerSide(settings)();

                try {
                    const store = await getReactServerSideStorage(req);
                    const serversideStorage = store.getState();

                    return {
                        serversideStorage: JSON.stringify(serversideStorage),
                        serversideString: getServersideString(Application, store),
                    };
                } catch (e) {
                    const createStore = require(path.join(assets, 'redux', 'store'));
                    const store = createStore({});
                    const serversideStorage = store.getState();

                    return {
                        serversideStorage: JSON.stringify(serversideStorage),
                        serversideString: getServersideString(Application, store),
                    };
                }
            },

            getFreshStore: (req) => {
                const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
                require('babel-register')(babelrc);
                const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
                const createStore = require(path.join(assets, 'redux', 'store'));
                const store = createStore({});
                const storage = store.getState();
                setServerSideCache(req, storage);
                return storage;
            }
        },

        vue: {

            getServerSideStorage: getVueServerSideStorage,
            setServerSideStorage: setServerSideCache,

            serverSide: async (pageName, req) => {
                const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')));
                require('babel-register')(babelrc);
                const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
                const getServersideString = handleServerSide(settings)();

                const assetPath = path.join(assets, pageName);
                const fileArray = assetPath.split('/');
                fileArray.pop();
                const filePath = fileArray.join('/') + '/component.vue';

                try {
                    const serversideStorage = await getVueServerSideStorage(req);
                    const serversideString = await getServersideString(filePath, serversideStorage);

                    return {
                        serversideStorage: JSON.stringify(serversideStorage),
                        serversideString: serversideString,
                    }
                } catch(e) {
                    const createStore = require(path.join(assets, 'state', 'store'));
                    const store = createStore({});
                    return {
                        serversideStorage: JSON.stringify(store),
                        serversideString: '',
                    }
                }
            },

            getFreshStore: (req) => {
                const babelrc = JSON.parse(fs.readFileSync(path.join(settings.context, '.babelrc')))
                require('babel-register')(babelrc);
                const assets = path.join(settings.context, 'app', 'assets', settings.jsType);
                const createStore = require(path.join(assets, 'state', 'store'));
                const store = createStore({});
                setServerSideCache(req, store);
                return store;
            }

        }
};

module.exports = {

    handleServerSide,

    renderServerSide: (settings) => serverSideOptions[settings.jsType],

};

