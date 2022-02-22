import { expGainAtLevel } from '../character/character';
import { QuestItemNames } from '../character/items';
import { Inventory } from '../ui/inventoryUI';
import { TownName, Towns } from './campaign';
import { Town1Dungeons } from './town1';
import { Town2Dungeons } from './town2';


export type Quest<TownName, Locations> = {
  reward: {
    unlockTown?: TownName
    unlockQuest?: CampaignQuestNames | CampaignQuestNames[]
    money?: number
    loot?: Inventory
    exp: number
  }
  location?: Locations
  objective: {
    travelToTown?: TownName,
    getItem?: QuestItemNames,
    completeDungeon?: CompleteDungeon<Towns, keyof Towns>,
  },
  description: string
}

class CompleteDungeon<A extends Towns, K extends keyof A> {
  constructor(public town: K, public dungeon: A[K]) { }
}

export type CampaignQuestNames = 'GetBanditBounty' | 'ExploreRuins'
export type QuestLocations = Town1Dungeons | Town2Dungeons

export type MainQuests = Record<CampaignQuestNames, Quest<TownName, QuestLocations>>;

export const CAMPAIGN_QUESTS: MainQuests = {
  GetBanditBounty: {
    objective: {
      getItem: 'BanditBounty',
    },
    reward: {
      money: 1000,
      unlockQuest: 'ExploreRuins',
      unlockTown: 'camera_2',
      exp: expGainAtLevel(100)
    },
    location: 'Bandit Camp',
    description: 'Go to the bandit camp and get the bounty.'
  },
  ExploreRuins: {
    objective: {
      completeDungeon: new CompleteDungeon('camera_1', 'Ruins')
    },
    reward: {
      unlockTown: 'camera_2',
      exp: expGainAtLevel(2)
    },
    description: 'AWD'
  }
}