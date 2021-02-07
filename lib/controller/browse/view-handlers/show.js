'use strict';

const libQ = require('kew');
const bandcamp = require(bandcampPluginLibRoot + '/bandcamp');
const UIHelper = require(bandcampPluginLibRoot + '/helper/ui');
const ExplodableViewHandler = require(__dirname + '/explodable');

class ShowViewHandler extends ExplodableViewHandler {

    browse() {
        let view = this.getCurrentView();
        if (view.showUrl) {
            return this._browseShow(decodeURIComponent(view.showUrl));
        }
        else {
            return this._browseAllShows();
        }
    }

    _browseAllShows() {
        let self = this;
        let defer = libQ.defer();
        
        let prevUri = self.constructPrevUri();
        let view = self.getCurrentView();
        let model = self.getModel('show');
        let parser = self.getParser('show');

        let options = {
            limit: view.inSection ? bandcamp.getConfigValue('itemsPerSection', 5) : bandcamp.getConfigValue('itemsPerPage', 47)
        };

        if (view.pageRef) {
            let ref = self.parsePageRef(view.pageRef);
            options.pageToken = ref.pageToken;
            options.pageOffset = ref.pageOffset;
        }
       
        model.getShows(options).then( (results) => {
            let items = [];
            results.items.forEach( (result) => {
                items.push(parser.parseToListItem(result));
            });
            let nextPageRef = self.constructPageRef(results.nextPageToken, results.nextPageOffset);
            if (nextPageRef) {
                let nextUri = self.constructNextUri(nextPageRef);
                items.push(self.constructNextPageItem(nextUri));
            }
            let nav = {
                prev: {
                    uri: prevUri
                },
                lists: [
                    {
                        title: UIHelper.addBandcampIconToListTitle(bandcamp.getI18n('BANDCAMP_SHOWS')),
                        availableListViews: ['list', 'grid'],
                        items: items
                    }
                ]
            };

            defer.resolve({
                navigation: nav
            });
        }).fail( (error) => {
            defer.reject(error);
        });

        return defer.promise;
    }

    _browseShow(showUrl) {
        let self = this;
        let defer = libQ.defer();
        
        let prevUri = self.constructPrevUri();
        let showModel = self.getModel('show');
        let trackModel = self.getModel('track');
        let showParser = self.getParser('show');
        let trackParser = self.getParser('track');

        showModel.getShow(showUrl).then( (show) => {
            let link = {
                url: showUrl,
                text: bandcamp.getI18n('BANDCAMP_VIEW_LINK_SHOW'),
                icon: { type: 'bandcamp' },
                target: '_blank'
            };
            let playFullStreamSection = {
                title: UIHelper.constructListTitleWithLink('', link, true),
                availableListViews: ['list'],
                items: [ showParser.parseToListItem(show, 'playFullStream') ]
            };
            return {
                show,
                lists: [playFullStreamSection]
            };

        }).then( (data) => {
            let featuredTracksSection = {
                title: bandcamp.getI18n('BANDCAMP_FEATURED_TRACKS'),
                availableListViews: ['list'],
                items: []
            }
            let fetchTrackPromises = [];
            data.show.tracks.forEach( (track) => {
                fetchTrackPromises.push(trackModel.getTrack(track.url));
            });
            return libQ.all(fetchTrackPromises).then( (tracks) => {
                tracks.forEach( (track) => {
                    featuredTracksSection.items.push(trackParser.parseToListItem(track));
                });
                data.lists.push(featuredTracksSection);
                return data;
            }).fail( (error) => {
                return data;
            });

        }).then( (data) => {
            let nav = {
                prev: {
                    uri: prevUri
                },
                info: showParser.parseToHeader(data.show),
                lists: data.lists
            };

            defer.resolve({
                navigation: nav
            });

        }).fail( (error) => {
            defer.reject(error);
        });

        return defer.promise;
    }

    getTracksOnExplode() {
        let self = this;

        let view = self.getCurrentView();
        if (!view.showUrl) {
            return libQ.reject("Operation not supported");
        }

        let model = self.getModel('show');
        return model.getShow(decodeURIComponent(view.showUrl)).then( (show) => {
            // fake an artist and name so that it can be parsed
            show.artist = {
                name: show.date
            };
            show.album = {
                name: bandcamp.getI18n('BANDCAMP_HEADER_SHOW')
            };
            return show;
        });
    }

    /**
     * Override
     * 
     * Track uri:
     * bandcamp/show@showUrl={showUrl}
     */
    _getTrackUri(show) {
        return `bandcamp/show@showUrl=${encodeURIComponent(show.url)}`;
    }
}

module.exports = ShowViewHandler;