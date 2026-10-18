import { RegionId, RegionInfo } from '@/types/listing';

export const REGIONS: Record<RegionId, RegionInfo> = {
  'us-east-va': {
    id: 'us-east-va',
    name: 'US East (N. Virginia)',
    location: 'Ashburn, VA, USA',
    flag: '🇺🇸',
    country: 'United States',
    latencyAvgMs: 14,
  },
  'us-west-or': {
    id: 'us-west-or',
    name: 'US West (Oregon)',
    location: 'Hillsboro, OR, USA',
    flag: '🇺🇸',
    country: 'United States',
    latencyAvgMs: 22,
  },
  'eu-west-ie': {
    id: 'eu-west-ie',
    name: 'Europe West (Dublin)',
    location: 'Dublin, Ireland',
    flag: '🇮🇪',
    country: 'Ireland',
    latencyAvgMs: 68,
  },
  'eu-central-de': {
    id: 'eu-central-de',
    name: 'Europe Central (Frankfurt)',
    location: 'Frankfurt, Germany',
    flag: '🇩🇪',
    country: 'Germany',
    latencyAvgMs: 74,
  },
  'ap-northeast-jp': {
    id: 'ap-northeast-jp',
    name: 'Asia Pacific (Tokyo)',
    location: 'Tokyo, Japan',
    flag: '🇯🇵',
    country: 'Japan',
    latencyAvgMs: 118,
  },
  'ap-southeast-sg': {
    id: 'ap-southeast-sg',
    name: 'Asia Pacific (Singapore)',
    location: 'Jurong, Singapore',
    flag: '🇸🇬',
    country: 'Singapore',
    latencyAvgMs: 142,
  },
};
