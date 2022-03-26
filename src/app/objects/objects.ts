/*** Avatar ***/
export interface Crop {
    x: number, y: number, w: number, h: number
}

export class Avatar {
    id?: number;
    original?: string;
    xxsmall?: string;
    xsmall?: string;
    small?: string;
    large?: string;
    xlarge?: string;
    crop?: Crop;
}

export interface AvatarWrapper {
    avatar: Avatar;
}

/*** User ***/
export interface Country {
    id: number;
    name: string;
    description?: string;
}

export interface City {
    id: number;
    name: string;
    description?: string;
}

export interface UserStatistics {
    followers: number;
    followings: number;
    plays: number;
    mixes: number;
    tracks?: number;
    reposts: number;
    music: number;
}

export interface UserSubscription {
    product_name: string;
    expired_at: number;
    params: UserSubscriptionParams;
}

export interface UserSubscriptionParams {
    prolongation: boolean;
    currency: string;
}

export class User {
    id: number;
    name: string;
    lang?: string;
    email?: string;
    type?: string;
    location?: string;
    last_visited?: number;
    last_sign_in_at?: number;
    created_at?: number;
    updated_at?: number;
    email_confirmed?: boolean;
    invalid_email?: boolean;
    password?: string;
    current_password?: string;
    description_ru?: string;
    description_en?: string;
    country?: Country;
    city?: City;
    links?: string[];
    avatar?: Avatar;
    url: string;
    roles?: string[];
    dj?: boolean;
    online: boolean;
    statistics?: UserStatistics;
    genres?: string[];
    aliases?: string[];
    personal_playlist_id?: number;
    wallet_amount?: string;
    subscriptions?: UserSubscription[];
    mix_at?: number;
    weight?: string;
}

export interface UserWrapped {
    user: User;
}

/*** Mix ***/
export interface MixFilePath {
    src: string;
    type: string;
    quality: number;
}

export interface MixFile {
    id: number;
    preview: string;
    name: string;
    size: number;
    duration: number;
    path: MixFilePath[];
    video_preview: string;
}

export class Cover {
    id: number;
    original: string;
    thumb: string;
    thumb_large: string;
    blured: string;
    squared: string;
    thumb_squared_small: string;
}

export interface CoverWrapper {
    cover: Cover;
}

export interface Coowner {
    id: number;
    url: string;
    avatar: string;
    name: string;
    location: string;
    online: boolean;
    type: string;
}

export interface Coownership {
    confirmed: boolean;
    created_at: number;
    updated_at: number;
    co_ownership_type: string;
    co_owner: Coowner;
}

export interface MixStatistics {
    likes: number;
    likes_score: number;
    comments: number;
    reposts: number;
    shares: number;
    downloads: number;
    plays: number;
    listeners: number;
}

export class Mix {
    id: number;
    title: string;
    status: string;
    duration: number;
    cover: Cover;
    file: MixFile;
    waveform: string;
    description_ru: string;
    description_en: string;
    tracklist: string[];
    created_at: number;
    updated_at: number;
    unregistered_author: string;
    url: string;
    channel: string;
    on_channel: boolean;
    accepted_at: number;
    video_url: string;
    user: User;
    tags: string[];
    co_owners: Coownership[];
    sort_id: number;
    statistics: MixStatistics;
    liked_users: User[];
    liked: [boolean, number];
    reposted_users: User[];
    commented: boolean;
    played: boolean;
    played_users: User[];
    in_collection: boolean;
    in_playlists: number[];
}

export interface PaginatedMixes {
    total_items: number;
    page: number;
    per_page: number;
    total_pages: number;
    items: Mix[];
}

export interface PaginatedMixesPlucked {
    total_items: number;
    page: number;
    per_page: number;
    total_pages: number;
    items: number[];
}

export interface SimpleMixRef {
    id: number;
    loaded: boolean;
}

export interface MixLikeResult {
  	result: boolean;
  	mix_id: number;
  	user_id: number;
  	score: number;
}

/*** Player ***/
export interface Player {
    id: number;
    file: MixFilePath;
    state: string;
    time: number;
    tracking: number;
    duration: number;
}

export interface LastPlayer {
    id: number;
    state: string;
}

/*** Draggable event ***/
export interface ClientRect {
    name?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    layerY?: any;
    layerX?: any;
    element?: any;
    marginTop?: number;
    marginLeft?: number;
}

/*** MixLike event ***/
export interface MixLikeEvent {
    sender: string; // from which component event was sent
    mixId: number;
}

/*** Playlist and queue ***/
export interface PlaylistItem {
    id: number;
    playlist_id: number;
    type: string;
    duration: number;
    sort_id: number;
    item: Mix;
}

export interface PlaylistItemPlucked {
    id: number;
    playlist_id: number;
    type: string;
    duration: number;
    sort_id: number;
    item: number;
}

export class Playlist {
    id: number;
    user: User;
    cover: Cover;
    title: string;
  	url: string;
  	description: string;
  	public: boolean;
  	genres: string[];
  	created_at: number;
  	updated_at: number;
  	total_items: number;
}

export interface PaginatedMixesForPlaylist {
    total_items: number;
    page: number;
    per_page: number;
    total_pages: number;
    items: PlaylistItem[];
}

export interface PaginatedMixesForPlaylistPlucked {
    total_items: number;
    page: number;
    per_page: number;
    total_pages: number;
    items: PlaylistItemPlucked[];
}

export interface QueueMixRef {
    id: number;
    loaded: boolean;
    playlist: string;
}

/*** Country / City ***/

export interface Country {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
    region?: string;
}
