import SlayerImg from '../../assets/charaters/covid_slayer.png';
import MonsterImg from '../../assets/charaters/covid_monster.png';

export type CharacterKey = 'slayer' | 'monster';

export type CharacterDef = {
  key: CharacterKey;
  name: string;
  portrait: string;
  sprite: string;
}

export const characters: Record<CharacterKey, CharacterDef> = {
  slayer: {
    key: 'slayer',
    name: 'Covid Slayer',
    portrait: SlayerImg,
    sprite: SlayerImg,
  },
  monster: {
    key: 'monster',
    name: 'Covid Monster',
    portrait: MonsterImg,
    sprite: MonsterImg,
  },
};

export const getOppositeCharacter = (key: CharacterKey): CharacterKey =>
  key === 'slayer' ? 'monster' : 'slayer';
