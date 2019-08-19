const fs = require('fs');
const path = require('path');

const serverSideOptions = {

        js: {
            serverSide: async (pageName, req) => {
                const assets = path.join(__dirname, '..', '..', 'assets', settings.jsType, 'storage', 'store');
                const store = require(assets);
                try {
                    let storage = await global.redis.getAsync(req.session.id);
                    storage = JSON.parse(storage);
                    return { serversideStorage: JSON.stringify(store(storage)) };
                } catch (e) {
                    return { serversideStorage: JSON.stringify(store({})) };
                }
            },

            getFreshStore: (req) => {
                const assets = path.join(__dirname, '..', '..', 'assets', settings.jsType);
                const store = require(path.join(assets, 'storage', 'store'))({});
                const storage = store.getState();
                global.redis.set(req.session.id, JSON.stringify(storage));
                return storage;
            },
        },

        react: {
            serverSide: async (pageName, req) => {
                const assets = path.join(__dirname, '..', '..', 'assets', settings.jsType);
                const createStore = require(path.join(assets, 'redux', 'store'));
                const componentArray = pageName.split('/');
                componentArray.pop();
                const componentPath = componentArray.join('/') + '/component';

                const Application = require(path.join(assets, componentPath));
                const getServersideString = require('../../webpack/serverside');

                try {
                    let redux = await global.redis.getAsync(req.session.id);
                    redux = !!redux ? JSON.parse(redux) : {};
                    const store = createStore(redux);
                    redux = redux || store.getState();

                    return {
                        serversideStorage: JSON.stringify(redux),
                        serversideString: getServersideString(Application, store),
                    };
                } catch (e) {
                    const store = createStore({});
                    return {
                        serversideStorage: JSON.stringify({}),
                        serversideString: getServersideString(Application, store),
                    };
                }
            },

            getFreshStore: (req) => {
                const assets = path.join(__dirname, '..', '..', 'assets', settings.jsType);
                const createStore = require(path.join(assets, 'redux', 'store'));
                const store = createStore({});
                const storage = store.getState();
                global.redis.set(req.session.id, JSON.stringify(storage));
                return storage;
            }
        },

        vue: {

            serverSide: async (pageName, req) => {
                const assets = path.join(__dirname, '..', '..', 'assets', settings.jsType);
                const createStore = require(path.join(assets, 'redux', 'store'));
                const componentArray = pageName.split('/');
                componentArray.pop();
                const componentPath = componentArray.join('/') + '/component';

                const Application = require(path.join(assets, componentPath));
                const getServersideString = require('../../webpack/serverside');

                try {
                    let redux = await global.redis.getAsync(req.session.id);
                    redux = !!redux ? JSON.parse(redux) : {};
                    const store = createStore(redux);
                    redux = redux || store.getState();

                    return {
                        serversideStorage: JSON.stringify(redux),
                        serversideString: getServersideString(Application, store),
                    };
                } catch (e) {
                    const store = createStore({});
                    return {
                        serversideStorage: JSON.stringify({}),
                        serversideString: getServersideString(Application, store),
                    };
                }
            },

            getFreshStore: (req) => {
                const assets = path.join(__dirname, '..', '..', 'assets', settings.jsType);
                const createStore = require(path.join(assets, 'redux', 'store'));
                const store = createStore({});
                const storage = store.getState();
                global.redis.set(req.session.id, JSON.stringify(storage));
                return storage;
            }

        }
};

module.exports = {

    renderServerSide: (settings) => serverSideOptions[settings.jsType],

    handleServerSide: (settings) => {
        const options = require('../utils/handleServerSideOptions');
        return options[settings.jsType];
    }
};
