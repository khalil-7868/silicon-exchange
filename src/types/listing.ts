export type ChipModel =
  | 'NVIDIA H100 SXM5'
  | 'NVIDIA H100 PCIe'
  | 'NVIDIA B200 SXM6'
  | 'NVIDIA RTX 5090'
  | 'NVIDIA RTX 4090'
  | 'NVIDIA RTX Pro 6000 Ada'
  | 'NVIDIA L40S'
  | 'NVIDIA A100 SXM4'
  | 'AMD Instinct MI300X'
  | 'AMD Instinct MI250X'
  | 'Apple M3 Ultra'
  | 'Google TPU v5e'
  | 'Intel Gaudi 2';

export type ListingStatus = 'available' | 'maintenance' | 'retired';

export type RegionId =
  | 'us-east-va'
  | 'us-west-or'
  | 'eu-west-ie'
  | 'eu-central-de'
  | 'ap-northeast-jp'
  | 'ap-southeast-sg';

export interface RegionInfo {
  id: RegionId;
  name: string;
  location: string;
  flag: string;
  country: string;
  latencyAvgMs: number;
}

export interface UtilizationSample {
  timestamp: number; // Unix ms
  utilizationPercent: number; // 0 to 100 integer or 1-dec
  powerWatts: number; // in Watts
  temperatureCelsius: number;
}

export interface Listing {
  id: string;
  slug: string;
  name: string;
  chip: ChipModel;
  architecture: string; // e.g. "Hopper GH100", "Blackwell GB200", "Ada Lovelace AD102", "CDNA 3", "Apple Silicon"
  memoryGb: number;
  memoryType: string; // e.g. "HBM3", "GDDR7", "Unified LPDDR5X", "HBM3e"
  memoryBandwidthGbps: number; // in GB/s
  tflops: number; // Tensor / FP16 TFLOPS
  hourlyRateCents: number; // in integer cents (e.g. 280 = $2.80)
  status: ListingStatus;
  region: RegionId;
  pciGen: string; // "PCIe 5.0 x16" or "NVLink 4.0 (900 GB/s)" or "Ultra Accelerator Link"
  hostCpu: string;
  hostRamGb: number;
  storageNvmeGb: number;
  tdpWatts: number;
  provider: {
    name: string;
    tier: string;
    uptime90d: number;
    renewableEnergy: boolean;
  };
  currentUtilization: number; // percentage 0-100
  currentPowerWatts: number;
  utilizationSamples: UtilizationSample[]; // 30 days * 24 hours = 720 samples
  tags: string[];
}
