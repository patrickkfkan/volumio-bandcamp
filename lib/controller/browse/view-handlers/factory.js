'use strict';

const ViewHelper = require(bandcampPluginLibRoot + '/helper/view');
const DiscoverViewHandler = require(__dirname + '/discover');
const ArtistViewHandler = require(__dirname + '/artist');
const LabelViewHandler = require(__dirname + '/label');
const AlbumViewHandler = require(__dirname + '/album');
const TrackViewHandler = require(__dirname + '/track');
const SearchViewHandler = require(__dirname + '/search');

class ViewHandlerFactory {

    static getHandler(uri) {
        let self = this;

        let views = ViewHelper.getViewsFromUri(uri);
        let curView = views.pop();
        let prevViews = views;

        return new self._viewToClass[curView.name](uri, curView, prevViews);
    }
}

ViewHandlerFactory._viewToClass = {
    'discover': DiscoverViewHandler,
    'artist': ArtistViewHandler,
    'label': LabelViewHandler,
    'album': AlbumViewHandler,
    'track': TrackViewHandler,
    'search': SearchViewHandler
}

module.exports = ViewHandlerFactory;