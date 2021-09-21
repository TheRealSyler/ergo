import { QuestItemNames } from '../character/items';
import { Inventory } from '../ui/inventoryUI';
import { TownName } from './campaign';
import { Town1Dungeons } from './town1';
import { Town2Dungeons } from './town2';

export type Quest<TownName, QuestName, Locations> = {
  reward: {
    unlockTown?: TownName
    unlockQuest?: QuestName
    money?: number
    loot?: Inventory
  }
  location?: Locations
  objective: {
    travelToTown?: TownName,
    getItem?: QuestItemNames
  }
}


export type MainQuestNames = 'GetBanditBounty' | 'ExploreRuins'
export type QuestLocations = Town1Dungeons | Town2Dungeons

export type MainQuests = Record<MainQuestNames, Quest<TownName, MainQuestNames, QuestLocations>>;

export const MAIN_QUESTS: MainQuests = {
  GetBanditBounty: {
    objective: {
      getItem: 'BanditBounty',
    },
    reward: {
      money: 10000,
      unlockQuest: 'ExploreRuins',
      loot: { items: ['Bandage', 'Bandage', 'Bandage'] },
      unlockTown: 'camera_2'
    },
    location: 'Bandit Camp'
  },
  ExploreRuins: {
    objective: {
      // TODO
    },
    reward: {
      unlockTown: 'camera_2'
    }
  }
}