import { ListingStatus, RegionId } from './listing';

export type SortField =
  | 'price-asc'
  | 'price-desc'
  | 'memory-desc'
  | 'tflops-desc'
  | 'util-desc'
  | 'util-asc';

export interface FilterState {
  search: string;
  regions: RegionId[];
  minMemory: number;
  maxMemory: number;
  status: ListingStatus | 'all';
  sort: SortField;
  chips: string[];
}
