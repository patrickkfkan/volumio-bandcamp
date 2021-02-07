'use strict';

const libQ = require('kew');
const bandcamp = require(bandcampPluginLibRoot + '/bandcamp');
const Model = require(bandcampPluginLibRoot + '/model');
const ViewHelper = require(bandcampPluginLibRoot + '/helper/view');

class PlayController {

    constructor() {
        this.mpdPlugin = bandcamp.getMpdPlugin();
    }

    /**
     * Track uri:
     * - bandcamp/track@trackUrl={trackUrl}@artistUrl={...}@albumUrl={...}
     * - bandcamp/show@showUrl={showUrl}
     */
    clearAddPlayTrack(track) {
        bandcamp.getLogger().info('[bandcamp-play] clearAddPlayTrack: ' + track.uri);

        let self = this;

        return self._getStreamUrl(track).then( (streamUrl) => {
            return self._doPlay(streamUrl, track);
        }).fail( (error) => {
            bandcamp.getLogger().error('[bandcamp-play] clearAddPlayTrack() error');
            bandcamp.getLogger().error(error);
        });
    }

    stop() {
        bandcamp.getStateMachine().setConsumeUpdateService('mpd', false, false);
        return this.mpdPlugin.stop();
    };

    pause() {
        bandcamp.getStateMachine().setConsumeUpdateService('mpd', false, false);
        return this.mpdPlugin.pause();
    };
  
    resume() {
        bandcamp.getStateMachine().setConsumeUpdateService('mpd', false, false);
        return this.mpdPlugin.resume();
    }
  
    seek(position) {
        bandcamp.getStateMachine().setConsumeUpdateService('mpd', false, false);
        return this.mpdPlugin.seek(position);
    }

    _getStreamUrl(track) {
        let views = ViewHelper.getViewsFromUri(track.uri);
        let trackView = views[1];

        if (trackView && trackView.name === 'track' && trackView.trackUrl) {
            let trackUrl = decodeURIComponent(trackView.trackUrl);
            let model = Model.getInstance('track');
            return model.getTrack(trackUrl).then( (track) => {
                if (!track.streamUrl) {
                    bandcamp.toast('warning', bandcamp.getI18n('BANDCAMP_SKIP_NON_PLAYABLE_TRACK', track.name));
                    bandcamp.getStateMachine().next();
                    return libQ.reject('Skipping non-playable track');
                }
                else {
                    let safeUri = track.streamUrl.replace(/"/g, '\\"');
                    return safeUri;
                }
            });
        }
        else if (trackView && trackView.name === 'show' && trackView.showUrl) {
            let showUrl = decodeURIComponent(trackView.showUrl);
            let model = Model.getInstance('show');
            return model.getShow(showUrl).then( (show) => {
                let streamUrl = show.streamUrl['mp3-128'] || show.streamUrl['opus-lo'];
                let safeUri = streamUrl.replace(/"/g, '\\"');
                return safeUri;
            });
        }
        else {
            return libQ.reject('Invalid track uri: ' + track.uri);
        }
    }

    _doPlay(streamUrl, track) {
        let mpdPlugin = this.mpdPlugin;

        return mpdPlugin.sendMpdCommand('stop', [])
        .then( () => {
            return mpdPlugin.sendMpdCommand('clear', []);
        })
        .then( () => {
            return mpdPlugin.sendMpdCommand('addid "' + streamUrl + '"', []);
        })
        .then( (addIdResp) => {
            if (addIdResp && typeof addIdResp.Id != undefined) {
                let trackUrl = addIdResp.Id;

                let cmdAddTitleTag = {
                    command: 'addtagid',
                    parameters: [trackUrl, 'title', track.title]
                };
                let cmdAddAlbumTag = {
                    command: 'addtagid',
                    parameters: [trackUrl, 'album', track.album]
                }
                let cmdAddArtistTag = {
                    command: 'addtagid',
                    parameters: [trackUrl, 'artist', track.artist]
                }

                return mpdPlugin.sendMpdCommandArray([cmdAddTitleTag, cmdAddAlbumTag, cmdAddArtistTag]);
            }
            else {
                return libQ.resolve();
            }
        })
        .then( () => {
            bandcamp.getStateMachine().setConsumeUpdateService('mpd', false, false);
            return mpdPlugin.sendMpdCommand('play', []);
        });
    }

}

module.exports = PlayController;