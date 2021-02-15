'use strict';

class Album {

    constructor(url, name, thumbnail, artist, tracks, featuredTrack) {
        this.type = 'album';
        this.url = url;
        this.name = name;
        this.thumbnail = thumbnail;
        this.artist = artist;
        this.tracks = tracks;
        this.featuredTrack = featuredTrack;
    }

}

module.exports = Album;