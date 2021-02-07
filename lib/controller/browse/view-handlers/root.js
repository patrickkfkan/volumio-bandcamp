'use strict';

const libQ = require('kew');
const bandcamp = require(bandcampPluginLibRoot + '/bandcamp');
const BaseViewHandler = require(__dirname + '/base');

class RootViewHandler extends BaseViewHandler {

    browse() {
        let self = this;
        let defer = libQ.defer();
      
        let fetches = [
            self._getShows(),
            self._getDiscoverResults()
        ];

        libQ.all(fetches).then( (results) => {
            let lists = [];
            results.forEach( (result) => {
                lists = lists.concat(result);
            });

            defer.resolve( {
                navigation: {
                    prev: {
                        uri: '/'
                    },
                    lists
                }
            });
        }).fail( (error) => {
            defer.reject(error);
        });

        return defer.promise;
    }

    _getShows() {
        let self = this;
        let defer = libQ.defer();

        let showsUri = `${self.getUri()}/shows@inSection=1`;
        require(bandcampPluginLibRoot + '/controller/browse/view-handlers/factory').getHandler(showsUri).browse()
            .then( (result) => {
                /*if (result.navigation.lists.length && result.navigation.lists[0].items.length) {
                    //let list = result.navigation.lists[0];
                    defer.resolve(result.navigation.lists);
                }
                else {
                    defer.resolve([]);
                }*/
                defer.resolve(result.navigation.lists);
            }).fail( (error) => {
                bandcamp.getLogger().error(error);
                defer.resolve([]);
            });

        return defer.promise;
    }

    _getDiscoverResults() {
        let self = this;
        let defer = libQ.defer();

        let discoverUri = `${self.getUri()}/discover@inSection=1`;

        require(bandcampPluginLibRoot + '/controller/browse/view-handlers/factory').getHandler(discoverUri).browse()
            .then( (result) => {
                /*if (result.navigation.lists.length && result.navigation.lists[0].items.length) {
                    //let list = result.navigation.lists[0];
                    defer.resolve(result.navigation.lists);
                }
                else {
                    defer.resolve([]);
                }*/
                defer.resolve(result.navigation.lists);
            }).fail( (error) => {
                bandcamp.getLogger().error(error);
                defer.resolve([]);
            });

        return defer.promise;
    }

}

module.exports = RootViewHandler;