export interface Genre {
  name: string;
  value: string;
}

export interface Tag {
  name: string;
  value: string;
}

export const genreList: string[] = [
  'deep',
  'techno',
  'psy',
  'electronica',
  'progressive',
  'breaks',
  'house',
  'disco',
  'funk',
  'other',
  'chill',
  'trance',
  'drum',
  'beats',
  'experimental'
];

export const tagList: string[] = [
  'abstract_techno',
  'acid',
  'afro_house',
  'ambient',
  'artcore',
  'atmospheric',
  'balearic',
  'beats',
  'breakbeat',
  'breaks',
  'chicago_house',
  'chillout',
  'chillrave',
  'dark_disco',
  'deep_tech',
  'deep_house',
  'deep_techno',
  'disco',
  'drum_n_bass',
  'dub',
  'dub_techno',
  'dubstep',
  'downtempo',
  'easy_listening',
  'electro',
  'electronica',
  'experimental',
  'funk',
  'funky_house',
  'future_bass',
  'garage',
  'grime',
  'goa_trance',
  'groove',
  'halfstep',
  'hard_techno',
  'hip_hop',
  'house',
  'idm',
  'indie_dance',
  'jazz',
  'jackin_house',
  'jungle',
  'organic_house',
  'liquid_funk',
  'lounge',
  'melodic_house',
  'minimal',
  'neoclassics',
  'neotrance',
  'new_age',
  'neurofunk',
  'progressive_breaks',
  'progressive_house',
  'progressive_tech',
  'progressive_trance',
  'psytrance',
  'psybass',
  'psydub',
  'psychill',
  'reggae',
  'rap',
  'slowdance',
  'soul',
  'tech_house',
  'techno',
  'trance',
  'trap',
  'tribal',
  'trip_hop',
  'world',
  'wonky_techno',
  '2step'
];

export function getGenres(): Genre[] {
  const genres: Genre[] = [];

  genreList.forEach(item => {
    genres.push(<Genre>{
      name: item,
      value: item
    });
  });

  return genres;
}

export function getTags(): Tag[] {
  const tags: Tag[] = [];

  tagList.forEach(item => {
    tags.push(<Tag>{
      name: item,
      value: item
    });
  });

  return tags;
}
