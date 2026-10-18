import { Listing } from '@/types/listing';
import { FilterState } from '@/types/filter';

/**
 * Pure filter and sort function for accelerator listings.
 */
export function filterAndSortListings(
  listings: Listing[],
  filters: FilterState
): Listing[] {
  let result = listings.slice();

  // 1. Text search
  if (filters.search && filters.search.trim().length > 0) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.chip.toLowerCase().includes(query) ||
        item.architecture.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.region.toLowerCase().includes(query) ||
        item.pciGen.toLowerCase().includes(query) ||
        item.hostCpu.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }

  // 2. Region filter
  if (filters.regions && filters.regions.length > 0) {
    const regionSet = new Set(filters.regions);
    result = result.filter((item) => regionSet.has(item.region));
  }

  // 3. Memory range filter
  if (typeof filters.minMemory === 'number') {
    result = result.filter((item) => item.memoryGb >= filters.minMemory);
  }
  if (typeof filters.maxMemory === 'number') {
    result = result.filter((item) => item.memoryGb <= filters.maxMemory);
  }

  // 4. Status filter
  if (filters.status && filters.status !== 'all') {
    result = result.filter((item) => item.status === filters.status);
  }

  // 5. Chips filter
  if (filters.chips && filters.chips.length > 0) {
    const chipSet = new Set(filters.chips);
    result = result.filter((item) => chipSet.has(item.chip));
  }

  // 6. Sorting
  result.sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.hourlyRateCents - b.hourlyRateCents;
      case 'price-desc':
        return b.hourlyRateCents - a.hourlyRateCents;
      case 'memory-desc':
        return b.memoryGb - a.memoryGb;
      case 'tflops-desc':
        return b.tflops - a.tflops;
      case 'util-desc':
        return b.currentUtilization - a.currentUtilization;
      case 'util-asc':
        return a.currentUtilization - b.currentUtilization;
      default:
        return 0;
    }
  });

  return result;
}
