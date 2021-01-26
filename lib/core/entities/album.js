'use strict';

class Album {

    constructor(url, name, thumbnail, artist, tracks) {
        this.type = 'album';
        this.url = url;
        this.name = name;
        this.thumbnail = thumbnail;
        this.artist = artist;
        this.tracks = tracks;
    }

}

module.exports = Album;