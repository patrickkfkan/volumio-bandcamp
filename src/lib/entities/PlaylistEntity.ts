import { Playlist, PlaylistListItem } from 'bandcamp-fetch';
import TrackEntity from './TrackEntity';

export interface PlaylistListItemEntity extends PlaylistListItem {
  type: 'playlist';
}

export interface PlaylistEntity extends Omit<Playlist, 'tracks'> {
  type: 'playlist';
  tracks: TrackEntity[];
};
