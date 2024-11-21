import { Album, Article, ArticleListItem, Artist, Label, LabelArtist, SearchResultAlbum, SearchResultArtist, SearchResultLabel, SearchResultTrack, Show, Tag, Track, UserKind } from 'bandcamp-fetch';
import AlbumEntity from '../entities/AlbumEntity';
import ArtistEntity from '../entities/ArtistEntity';
import BandEntity from '../entities/BandEntity';
import LabelEntity from '../entities/LabelEntity';
import TrackEntity from '../entities/TrackEntity';
import TagEntity from '../entities/TagEntity';
import ShowEntity from '../entities/ShowEntity';
import ArticleEntity, { ArticleEntityMediaItem, ArticleEntitySection } from '../entities/ArticleEntity';

export default class EntityConverter {
  static convertAlbum(data: Album): AlbumEntity {
    const result: AlbumEntity = {
      type: 'album',
      name: data.name
    };
    if (data.url) {
      result.url = data.url;
    }
    if (data.imageUrl) {
      result.thumbnail = data.imageUrl;
    }
    if (data.artist) {
      result.artist = this.convertArtist({ ...data.artist, type: 'artist' });
    }
    if (data.tracks) {
      result.tracks = data.tracks.map((track) => this.convertTrack({ ...track, type: 'track', album: undefined }));
    }
    if (data.featuredTrack) {
      result.featuredTrack = this.convertTrack({ ...data.featuredTrack, type: 'track' });
    }
    if (data.releaseDate) {
      result.releaseDate = data.releaseDate;
    }

    result.tracks?.forEach((track) => {
      track.album = {
        type: 'album',
        name: data.name
      };
      if (data.url) {
        track.album.url = data.url;
      }
      if (data.imageUrl) {
        track.album.thumbnail = data.imageUrl;
        if (!track.thumbnail) {
          track.thumbnail = data.imageUrl;
        }
      }
      if (!track.artist && result.artist) {
        track.artist = result.artist;
      }
    });

    return result;
  }

  static convertArtist(data: Artist | LabelArtist) : ArtistEntity {
    const result: ArtistEntity = {
      ...this.convertBand({ ...data, type: 'artist' }),
      type: 'artist'
    };
    if (data.label) {
      result.label = this.convertLabel(data.label);
    }

    return result;
  }

  static convertLabel(data: Label): LabelEntity {
    const result: LabelEntity = {
      ...this.convertBand(data),
      type: 'label'
    };

    return result;
  }

  static convertTrack(data: Track): TrackEntity {
    const result: TrackEntity = {
      type: 'track',
      name: data.name
    };
    if (data.id) {
      result.id = data.id;
    }
    if (data.url) {
      result.url = data.url;
    }
    if (data.duration) {
      result.duration = data.duration;
    }
    if (data.imageUrl) {
      result.thumbnail = data.imageUrl;
    }
    if (data.streamUrlHQ) {
      result.streamUrl = data.streamUrlHQ;
    }
    else if (data.streamUrl) {
      result.streamUrl = data.streamUrl;
    }
    if (data.album) {
      result.album = this.convertAlbum({ ...data.album, type: 'album', tracks: undefined });
    }
    if (data.artist) {
      result.artist = this.convertArtist({ ...data.artist, type: 'artist' });
    }
    if (data.position) {
      result.position = data.position;
    }

    if (result.album) {
      if (!result.album.thumbnail && data.imageUrl) {
        result.album.thumbnail = data.imageUrl;
      }
      if (!result.album.artist && result.artist) {
        result.album.artist = result.artist;
      }
    }

    return result;
  }

  static convertSearchResultItem(item: SearchResultArtist | SearchResultLabel | SearchResultAlbum | SearchResultTrack): ArtistEntity | LabelEntity | AlbumEntity | TrackEntity {
    switch (item.type) {
      case 'artist':
        return this.convertArtist(item);
      case 'label':
        return this.convertLabel(item);
      case 'album':
        const albumArtist = item.artist ? { name: item.artist } : undefined;
        return this.convertAlbum({ ...item, artist: albumArtist });
      case 'track':
        const trackArtist = item.artist ? { name: item.artist } : undefined;
        const trackAlbum = item.album ? { name: item.album } : undefined;
        return this.convertTrack({
          ...item,
          artist: trackArtist,
          album: trackAlbum
        });
    }
  }

  static convertShow(data: Show): ShowEntity {
    const result: ShowEntity = {
      type: 'show',
      name: data.name,
      url: data.url,
      description: data.description,
      date: data.publishedDate
    };

    if (data.imageUrl) {
      result.thumbnail = data.imageUrl;
    }
    if (data.streamUrl?.['mp3-128']) {
      result.streamUrl = data.streamUrl['mp3-128'];
    }
    if (data.duration) {
      result.duration = data.duration;
    }
    if (data.tracks) {
      result.tracks = data.tracks.map((track) => this.convertTrack({ ...track, type: 'track' }));
    }

    return result;
  }

  static convertBand(data: Artist | Label | UserKind): BandEntity {
    let type: BandEntity['type'];
    switch ((data as any).type) {
      case 'artist':
        type = 'artist';
        break;
      case 'label':
        type = 'label';
        break;
      default: // UserKind does not have 'type'
        type = 'artistOrLabel';
    }
    const result: BandEntity = {
      type,
      name: data.name
    };
    if (data.url) {
      result.url = data.url;
    }
    if (data.imageUrl) {
      result.thumbnail = data.imageUrl;
    }
    if (data.location) {
      result.location = data.location;
    }

    return result;
  }

  static convertTag(data: Tag): TagEntity {
    const result: TagEntity = {
      type: 'tag',
      name: data.name,
      value: data.value
    };

    if (data.imageUrls?.[0]) {
      result.thumbnail = data.imageUrls[0];
    }

    return result;
  }

  static convertArticle(data: Article): ArticleEntity {
    const result: ArticleEntity = {
      type: 'article',
      url: data.url,
      title: data.title,
      description: data.description,
      thumbnail: data.imageUrl,
      date: data.date,
      category: {
        name: data.category.name
      },
      author: {
        name: data.author.name,
        url: data.author.url
      },
      mediaItems: [],
      sections: []
    };

    if (data.category.url && result.category) {
      result.category.url = data.category.url;
    }

    result.mediaItems = data.mediaItems.map((item) => {
      let entityMediaItem;
      if (item.type === 'album') {
        entityMediaItem = {
          ...this.convertAlbum(item),
          featuredTrackPosition: item.featuredTrackPosition
        } as ArticleEntityMediaItem<AlbumEntity>;
      }
      else {
        entityMediaItem = {
          ...this.convertTrack(item),
          featuredTrackPosition: item.featuredTrackPosition
        } as ArticleEntityMediaItem<TrackEntity>;
      }
      if (item.mediaItemRef) {
        entityMediaItem.mediaItemRef = item.mediaItemRef;
      }
      return entityMediaItem;
    });

    result.sections = data.sections.map((section) => {
      const entitySection: ArticleEntitySection = {
        text: section.text
      };

      if (section.mediaItemRef) {
        entitySection.mediaItemRef = section.mediaItemRef;
      }
      if (section.heading) {
        entitySection.heading = {
          text: section.heading.text
        };
      }
      return entitySection;
    });

    return result;
  }

  static convertArticleListItem(data: ArticleListItem): ArticleEntity {
    const result: ArticleEntity = {
      type: 'article',
      url: data.url,
      title: data.title,
      date: data.date
    };
    if (data.category) {
      result.category = {
        name: data.category.name
      };
      if (data.category.url) {
        result.category.url = data.category.url;
      }
    }
    if (data.imageUrl) {
      result.thumbnail = data.imageUrl;
    }

    return result;
  }
}
