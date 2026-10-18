import { Listing, UtilizationSample, ListingStatus } from '@/types/listing';
import { createMulberry32, hashStringToSeed } from '@/lib/prng';

// Fixed base timestamp for deterministic timeline (e.g. October 18, 2026, 17:00 UTC)
export const ANCHOR_TIMESTAMP = 1792342800000;

function generateDeterministicSamples(
  listingId: string,
  tdpWatts: number,
  status: ListingStatus
): { samples: UtilizationSample[]; currentUtil: number; currentPower: number } {
  const seed = hashStringToSeed(listingId);
  const rng = createMulberry32(seed);

  const totalHours = 30 * 24; // 720 samples
  const oneHourMs = 60 * 60 * 1000;
  const startTimestamp = ANCHOR_TIMESTAMP - (totalHours - 1) * oneHourMs;

  const samples: UtilizationSample[] = [];

  const idlePower = Math.round(tdpWatts * 0.18);
  const activePowerDelta = tdpWatts - idlePower;

  // Generate organic compute pattern using seeded random walk + periodic compute spikes
  let currentLoad = 40 + rng() * 30;

  for (let i = 0; i < totalHours; i++) {
    const timestamp = startTimestamp + i * oneHourMs;
    const hourOfDay = (i % 24);
    const dayOfWeek = Math.floor(i / 24) % 7;

    if (status === 'retired') {
      samples.push({
        timestamp,
        utilizationPercent: 0,
        powerWatts: Math.round(idlePower * 0.4),
        temperatureCelsius: 27,
      });
      continue;
    }

    if (status === 'maintenance' && i > totalHours - 48) {
      // Last 48 hours in maintenance
      const maintUtil = Math.round(rng() * 8);
      samples.push({
        timestamp,
        utilizationPercent: maintUtil,
        powerWatts: idlePower + Math.round(maintUtil * 2),
        temperatureCelsius: 32 + Math.round(maintUtil * 0.5),
      });
      continue;
    }

    // Periodic workload batch shifts (training runs usually last 8 to 36 hours)
    const drift = (rng() - 0.48) * 12;
    currentLoad = Math.max(10, Math.min(98, currentLoad + drift));

    // Slight daytime/weekday diurnal effect on cloud spot compute
    const diurnal = Math.sin((hourOfDay / 24) * Math.PI * 2) * 6;
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? -4 : 4;

    const util = Math.round(Math.max(5, Math.min(99, currentLoad + diurnal + weekendFactor + (rng() - 0.5) * 8)));

    // Power directly correlates with utilization + small thermal noise
    const power = Math.round(idlePower + (util / 100) * activePowerDelta + (rng() - 0.5) * 12);
    const temp = Math.round(34 + (util / 100) * 42 + (rng() - 0.5) * 3);

    samples.push({
      timestamp,
      utilizationPercent: util,
      powerWatts: Math.max(idlePower, Math.min(tdpWatts, power)),
      temperatureCelsius: temp,
    });
  }

  const lastSample = samples[samples.length - 1];
  return {
    samples,
    currentUtil: lastSample.utilizationPercent,
    currentPower: lastSample.powerWatts,
  };
}

interface RawListingData {
  id: string;
  slug: string;
  name: string;
  chip: Listing['chip'];
  architecture: string;
  memoryGb: number;
  memoryType: string;
  memoryBandwidthGbps: number;
  tflops: number;
  hourlyRateCents: number;
  status: ListingStatus;
  region: Listing['region'];
  pciGen: string;
  hostCpu: string;
  hostRamGb: number;
  storageNvmeGb: number;
  tdpWatts: number;
  provider: Listing['provider'];
  tags: string[];
}

const RAW_LISTINGS: RawListingData[] = [
  {
    id: 'node-01',
    slug: 'h100-sxm5-ashburn-01',
    name: 'NVIDIA H100 SXM5 80GB (Ashburn-A1)',
    chip: 'NVIDIA H100 SXM5',
    architecture: 'Hopper GH100',
    memoryGb: 80,
    memoryType: 'HBM3',
    memoryBandwidthGbps: 3350,
    tflops: 1979,
    hourlyRateCents: 280,
    status: 'available',
    region: 'us-east-va',
    pciGen: 'NVLink 4.0 (900 GB/s)',
    hostCpu: 'Dual AMD EPYC 9654 (192 Cores)',
    hostRamGb: 512,
    storageNvmeGb: 3840,
    tdpWatts: 700,
    provider: {
      name: 'Equinix Metal Ashburn DC11',
      tier: 'Tier IV',
      uptime90d: 99.99,
      renewableEnergy: true,
    },
    tags: ['SXM5', 'NVLink 4.0', 'FP8 Transformer Engine', 'LLM Pretraining'],
  },
  {
    id: 'node-02',
    slug: 'h100-pcie-dublin-02',
    name: 'NVIDIA H100 PCIe 80GB (Dublin-D1)',
    chip: 'NVIDIA H100 PCIe',
    architecture: 'Hopper GH100',
    memoryGb: 80,
    memoryType: 'HBM2e',
    memoryBandwidthGbps: 2000,
    tflops: 1513,
    hourlyRateCents: 230,
    status: 'available',
    region: 'eu-west-ie',
    pciGen: 'PCIe 5.0 x16 (128 GB/s)',
    hostCpu: 'AMD EPYC 9554 (64 Cores)',
    hostRamGb: 256,
    storageNvmeGb: 1920,
    tdpWatts: 350,
    provider: {
      name: 'EirData Clonee Tier IV',
      tier: 'Tier IV',
      uptime90d: 99.98,
      renewableEnergy: true,
    },
    tags: ['PCIe 5.0', 'Energy Efficient', 'Inference Low-Latency'],
  },
  {
    id: 'node-03',
    slug: 'b200-sxm6-ashburn-03',
    name: 'NVIDIA B200 SXM6 192GB (Ashburn-Blackwell-01)',
    chip: 'NVIDIA B200 SXM6',
    architecture: 'Blackwell GB200',
    memoryGb: 192,
    memoryType: 'HBM3e',
    memoryBandwidthGbps: 8000,
    tflops: 4500,
    hourlyRateCents: 490,
    status: 'available',
    region: 'us-east-va',
    pciGen: 'NVLink 5.0 (1.8 TB/s)',
    hostCpu: 'Dual AMD EPYC 9754 (256 Cores)',
    hostRamGb: 1024,
    storageNvmeGb: 7680,
    tdpWatts: 1000,
    provider: {
      name: 'Digital Realty Ashburn Campus',
      tier: 'Tier IV',
      uptime90d: 99.99,
      renewableEnergy: true,
    },
    tags: ['Blackwell Next-Gen', '192GB HBM3e', 'NVLink 5.0', 'FP4 Support'],
  },
  {
    id: 'node-04',
    slug: 'rtx5090-hillsboro-04',
    name: 'NVIDIA RTX 5090 32GB (Oregon-Hydro-01)',
    chip: 'NVIDIA RTX 5090',
    architecture: 'Blackwell GB202',
    memoryGb: 32,
    memoryType: 'GDDR7',
    memoryBandwidthGbps: 1792,
    tflops: 1650,
    hourlyRateCents: 120,
    status: 'available',
    region: 'us-west-or',
    pciGen: 'PCIe 5.0 x16',
    hostCpu: 'Intel Xeon Platinum 8580 (60 Cores)',
    hostRamGb: 256,
    storageNvmeGb: 3840,
    tdpWatts: 600,
    provider: {
      name: 'Cascade Green Hydro Computing',
      tier: 'Tier III+',
      uptime90d: 99.95,
      renewableEnergy: true,
    },
    tags: ['GDDR7 28Gbps', 'Diffusion Model Fast-Gen', 'Fine-Tuning'],
  },
  {
    id: 'node-05',
    slug: 'rtx5090-frankfurt-05',
    name: 'NVIDIA RTX 5090 32GB (Frankfurt-FRA1)',
    chip: 'NVIDIA RTX 5090',
    architecture: 'Blackwell GB202',
    memoryGb: 32,
    memoryType: 'GDDR7',
    memoryBandwidthGbps: 1792,
    tflops: 1650,
    hourlyRateCents: 125,
    status: 'available',
    region: 'eu-central-de',
    pciGen: 'PCIe 5.0 x16',
    hostCpu: 'AMD EPYC 9354 (32 Cores)',
    hostRamGb: 256,
    storageNvmeGb: 1920,
    tdpWatts: 600,
    provider: {
      name: 'Telehouse Frankfurt Main-East',
      tier: 'Tier IV',
      uptime90d: 99.97,
      renewableEnergy: true,
    },
    tags: ['GDDR7', 'EU GDPR Compliant', 'Cost Effective'],
  },
  {
    id: 'node-06',
    slug: 'mi300x-frankfurt-06',
    name: 'AMD Instinct MI300X 192GB (Frankfurt-CDNA3-01)',
    chip: 'AMD Instinct MI300X',
    architecture: 'CDNA 3',
    memoryGb: 192,
    memoryType: 'HBM3',
    memoryBandwidthGbps: 5300,
    tflops: 2614,
    hourlyRateCents: 340,
    status: 'available',
    region: 'eu-central-de',
    pciGen: 'Ultra Accelerator Link (UALink)',
    hostCpu: 'AMD EPYC 9754 Bergamo (128 Cores)',
    hostRamGb: 768,
    storageNvmeGb: 7680,
    tdpWatts: 750,
    provider: {
      name: 'Equinix FR4 Frankfurt',
      tier: 'Tier IV',
      uptime90d: 99.99,
      renewableEnergy: true,
    },
    tags: ['192GB HBM3', '70B LLM Zero-Quant', 'ROCm 6.2 Native', 'UALink'],
  },
  {
    id: 'node-07',
    slug: 'mi300x-ashburn-07',
    name: 'AMD Instinct MI300X 192GB (Ashburn-East-02)',
    chip: 'AMD Instinct MI300X',
    architecture: 'CDNA 3',
    memoryGb: 192,
    memoryType: 'HBM3',
    memoryBandwidthGbps: 5300,
    tflops: 2614,
    hourlyRateCents: 335,
    status: 'available',
    region: 'us-east-va',
    pciGen: 'Ultra Accelerator Link (UALink)',
    hostCpu: 'AMD EPYC 9654 (96 Cores)',
    hostRamGb: 768,
    storageNvmeGb: 3840,
    tdpWatts: 750,
    provider: {
      name: 'CoreSite Ashburn VA3',
      tier: 'Tier IV',
      uptime90d: 99.96,
      renewableEnergy: true,
    },
    tags: ['192GB VRAM', 'Massive Concurrency', 'vLLM Accelerated'],
  },
  {
    id: 'node-08',
    slug: 'rtx-pro-6000-dublin-08',
    name: 'NVIDIA RTX Pro 6000 Ada 48GB (Dublin-D2)',
    chip: 'NVIDIA RTX Pro 6000 Ada',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 48,
    memoryType: 'GDDR6 ECC',
    memoryBandwidthGbps: 960,
    tflops: 1457,
    hourlyRateCents: 185,
    status: 'available',
    region: 'eu-west-ie',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'Intel Xeon Gold 6448Y',
    hostRamGb: 256,
    storageNvmeGb: 1920,
    tdpWatts: 300,
    provider: {
      name: 'Interxion Dublin DUB1',
      tier: 'Tier III+',
      uptime90d: 99.97,
      renewableEnergy: true,
    },
    tags: ['ECC VRAM', 'Workstation Stability', '3D Gaussian Splatting'],
  },
  {
    id: 'node-09',
    slug: 'rtx-pro-6000-tokyo-09',
    name: 'NVIDIA RTX Pro 6000 Ada 48GB (Tokyo-TY1)',
    chip: 'NVIDIA RTX Pro 6000 Ada',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 48,
    memoryType: 'GDDR6 ECC',
    memoryBandwidthGbps: 960,
    tflops: 1457,
    hourlyRateCents: 195,
    status: 'available',
    region: 'ap-northeast-jp',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'AMD EPYC 9354 (32 Cores)',
    hostRamGb: 256,
    storageNvmeGb: 1920,
    tdpWatts: 300,
    provider: {
      name: 'NTT Com Tokyo Tier IV',
      tier: 'Tier IV',
      uptime90d: 99.99,
      renewableEnergy: false,
    },
    tags: ['ECC Memory', 'Low AP Latency', 'Rendering & LoRA'],
  },
  {
    id: 'node-10',
    slug: 'l40s-hillsboro-10',
    name: 'NVIDIA L40S 48GB (Oregon-Cascade-02)',
    chip: 'NVIDIA L40S',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 48,
    memoryType: 'GDDR6',
    memoryBandwidthGbps: 864,
    tflops: 1466,
    hourlyRateCents: 165,
    status: 'available',
    region: 'us-west-or',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'AMD EPYC 9454 (48 Cores)',
    hostRamGb: 384,
    storageNvmeGb: 3840,
    tdpWatts: 350,
    provider: {
      name: 'Stack Infrastructure Hillsboro',
      tier: 'Tier III',
      uptime90d: 99.94,
      renewableEnergy: true,
    },
    tags: ['Omniverse Ready', 'GenAI Serving', '4th-Gen Tensor Cores'],
  },
  {
    id: 'node-11',
    slug: 'l40s-singapore-11',
    name: 'NVIDIA L40S 48GB (SG-Jurong-01)',
    chip: 'NVIDIA L40S',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 48,
    memoryType: 'GDDR6',
    memoryBandwidthGbps: 864,
    tflops: 1466,
    hourlyRateCents: 175,
    status: 'available',
    region: 'ap-southeast-sg',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'Intel Xeon Platinum 8480+',
    hostRamGb: 256,
    storageNvmeGb: 1920,
    tdpWatts: 350,
    provider: {
      name: 'Singtel West Data Hub',
      tier: 'Tier IV',
      uptime90d: 99.98,
      renewableEnergy: false,
    },
    tags: ['Southeast Asia Low-Ping', 'FP8 High Throughput'],
  },
  {
    id: 'node-12',
    slug: 'a100-sxm4-ashburn-12',
    name: 'NVIDIA A100 SXM4 80GB (Ashburn-Legacy-1)',
    chip: 'NVIDIA A100 SXM4',
    architecture: 'Ampere GA100',
    memoryGb: 80,
    memoryType: 'HBM2e',
    memoryBandwidthGbps: 2039,
    tflops: 624,
    hourlyRateCents: 160,
    status: 'available',
    region: 'us-east-va',
    pciGen: 'NVLink 3.0 (600 GB/s)',
    hostCpu: 'AMD EPYC 7763 (64 Cores)',
    hostRamGb: 512,
    storageNvmeGb: 3840,
    tdpWatts: 400,
    provider: {
      name: 'CyrusOne Northern VA',
      tier: 'Tier III+',
      uptime90d: 99.95,
      renewableEnergy: true,
    },
    tags: ['Battle Tested', 'NVLink 3.0', 'CUDA 11/12 Compatible'],
  },
  {
    id: 'node-13',
    slug: 'a100-sxm4-dublin-13',
    name: 'NVIDIA A100 SXM4 80GB (Dublin-Ampere-02)',
    chip: 'NVIDIA A100 SXM4',
    architecture: 'Ampere GA100',
    memoryGb: 80,
    memoryType: 'HBM2e',
    memoryBandwidthGbps: 2039,
    tflops: 624,
    hourlyRateCents: 155,
    status: 'available',
    region: 'eu-west-ie',
    pciGen: 'NVLink 3.0 (600 GB/s)',
    hostCpu: 'AMD EPYC 7763 (64 Cores)',
    hostRamGb: 512,
    storageNvmeGb: 3840,
    tdpWatts: 400,
    provider: {
      name: 'Equinix DB2 Dublin',
      tier: 'Tier IV',
      uptime90d: 99.98,
      renewableEnergy: true,
    },
    tags: ['Reliable Benchmark', 'High Bandwidth HBM2e'],
  },
  {
    id: 'node-14',
    slug: 'm3-ultra-tokyo-14',
    name: 'Apple M3 Ultra 128GB (Tokyo-MacGrid-01)',
    chip: 'Apple M3 Ultra',
    architecture: 'Apple Silicon',
    memoryGb: 128,
    memoryType: 'Unified LPDDR5X',
    memoryBandwidthGbps: 800,
    tflops: 650,
    hourlyRateCents: 95,
    status: 'available',
    region: 'ap-northeast-jp',
    pciGen: 'Ultra Unified Fabric',
    hostCpu: 'Apple M3 Ultra 28-Core',
    hostRamGb: 128,
    storageNvmeGb: 2048,
    tdpWatts: 160,
    provider: {
      name: 'MacStadium Tokyo Node Hub',
      tier: 'Tier IV',
      uptime90d: 99.99,
      renewableEnergy: true,
    },
    tags: ['Apple Silicon MLX', 'Unified Memory Architecture', 'Ultra Quiet Energy'],
  },
  {
    id: 'node-15',
    slug: 'm3-ultra-hillsboro-15',
    name: 'Apple M3 Ultra 192GB (Oregon-MacFarm-02)',
    chip: 'Apple M3 Ultra',
    architecture: 'Apple Silicon',
    memoryGb: 192,
    memoryType: 'Unified LPDDR5X',
    memoryBandwidthGbps: 800,
    tflops: 650,
    hourlyRateCents: 115,
    status: 'available',
    region: 'us-west-or',
    pciGen: 'Ultra Unified Fabric',
    hostCpu: 'Apple M3 Ultra 28-Core',
    hostRamGb: 192,
    storageNvmeGb: 4096,
    tdpWatts: 160,
    provider: {
      name: 'Cascade Bare Metal Mac Lab',
      tier: 'Tier III+',
      uptime90d: 99.96,
      renewableEnergy: true,
    },
    tags: ['192GB Unified Memory', 'Apple MLX Inference', 'Zero Memory Transfer Overhead'],
  },
  {
    id: 'node-16',
    slug: 'tpu-v5e-ashburn-16',
    name: 'Google TPU v5e Pod-Slice 32GB (Ashburn-G1)',
    chip: 'Google TPU v5e',
    architecture: 'Google TPU Architecture',
    memoryGb: 32,
    memoryType: 'HBM2',
    memoryBandwidthGbps: 819,
    tflops: 394,
    hourlyRateCents: 85,
    status: 'available',
    region: 'us-east-va',
    pciGen: 'ICI 2D Torus Interconnect',
    hostCpu: 'Custom Intel Xeon Sapphire Rapids',
    hostRamGb: 128,
    storageNvmeGb: 1920,
    tdpWatts: 250,
    provider: {
      name: 'Equinix DC14 Google Direct Connect',
      tier: 'Tier IV',
      uptime90d: 99.99,
      renewableEnergy: true,
    },
    tags: ['JAX Native', 'XLA Optimized', 'Ultra Low Dollar-Per-FLOP'],
  },
  {
    id: 'node-17',
    slug: 'tpu-v5e-singapore-17',
    name: 'Google TPU v5e Pod-Slice 32GB (SG-Jurong-TPU2)',
    chip: 'Google TPU v5e',
    architecture: 'Google TPU Architecture',
    memoryGb: 32,
    memoryType: 'HBM2',
    memoryBandwidthGbps: 819,
    tflops: 394,
    hourlyRateCents: 90,
    status: 'available',
    region: 'ap-southeast-sg',
    pciGen: 'ICI 2D Torus Interconnect',
    hostCpu: 'Custom Intel Xeon Sapphire Rapids',
    hostRamGb: 128,
    storageNvmeGb: 1920,
    tdpWatts: 250,
    provider: {
      name: 'Telstra Singapore Tier III',
      tier: 'Tier III+',
      uptime90d: 99.97,
      renewableEnergy: true,
    },
    tags: ['Google TPU', 'Matrix Multiply Engine', 'JAX/PyTorch XLA'],
  },
  {
    id: 'node-18',
    slug: 'gaudi2-frankfurt-18',
    name: 'Intel Gaudi 2 96GB (Frankfurt-HL225B-01)',
    chip: 'Intel Gaudi 2',
    architecture: 'Habana Gaudi 2',
    memoryGb: 96,
    memoryType: 'HBM2e',
    memoryBandwidthGbps: 2450,
    tflops: 860,
    hourlyRateCents: 140,
    status: 'available',
    region: 'eu-central-de',
    pciGen: 'Integrated 24x 100GbE RoCEv2',
    hostCpu: 'Intel Xeon Platinum 8380 (80 Cores)',
    hostRamGb: 512,
    storageNvmeGb: 3840,
    tdpWatts: 600,
    provider: {
      name: 'Mainova WebHouse Frankfurt',
      tier: 'Tier IV',
      uptime90d: 99.98,
      renewableEnergy: true,
    },
    tags: ['96GB HBM2e', 'Native 100GbE RoCEv2', 'Optimum Habana'],
  },
  {
    id: 'node-19',
    slug: 'rtx4090-hillsboro-19',
    name: 'NVIDIA RTX 4090 24GB (Oregon-Consumer-01)',
    chip: 'NVIDIA RTX 4090',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 24,
    memoryType: 'GDDR6X',
    memoryBandwidthGbps: 1008,
    tflops: 1321,
    hourlyRateCents: 75,
    status: 'available',
    region: 'us-west-or',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'AMD Ryzen 9 7950X (16 Cores)',
    hostRamGb: 128,
    storageNvmeGb: 1920,
    tdpWatts: 450,
    provider: {
      name: 'Cascade Edge Co-op',
      tier: 'Tier III',
      uptime90d: 99.92,
      renewableEnergy: true,
    },
    tags: ['Budget King', 'Fine-Tuning SDXL', 'TensorRT-LLM'],
  },
  {
    id: 'node-20',
    slug: 'rtx4090-tokyo-20',
    name: 'NVIDIA RTX 4090 24GB (Tokyo-Ginza-02)',
    chip: 'NVIDIA RTX 4090',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 24,
    memoryType: 'GDDR6X',
    memoryBandwidthGbps: 1008,
    tflops: 1321,
    hourlyRateCents: 80,
    status: 'available',
    region: 'ap-northeast-jp',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'Intel Core i9-14900K',
    hostRamGb: 128,
    storageNvmeGb: 1920,
    tdpWatts: 450,
    provider: {
      name: 'KDDI Otemachi Telehouse',
      tier: 'Tier IV',
      uptime90d: 99.97,
      renewableEnergy: false,
    },
    tags: ['Fast Inference', 'High Single-Precision Speed'],
  },
  {
    id: 'node-21',
    slug: 'h100-sxm5-frankfurt-21',
    name: 'NVIDIA H100 SXM5 80GB (Frankfurt-Maint-01)',
    chip: 'NVIDIA H100 SXM5',
    architecture: 'Hopper GH100',
    memoryGb: 80,
    memoryType: 'HBM3',
    memoryBandwidthGbps: 3350,
    tflops: 1979,
    hourlyRateCents: 290,
    status: 'maintenance',
    region: 'eu-central-de',
    pciGen: 'NVLink 4.0 (900 GB/s)',
    hostCpu: 'Dual AMD EPYC 9654',
    hostRamGb: 512,
    storageNvmeGb: 3840,
    tdpWatts: 700,
    provider: {
      name: 'Equinix FR2 Frankfurt',
      tier: 'Tier IV',
      uptime90d: 99.95,
      renewableEnergy: true,
    },
    tags: ['Under Maintenance', 'Liquid Cooling Loop Servicing', 'SXM5'],
  },
  {
    id: 'node-22',
    slug: 'b200-sxm6-dublin-22',
    name: 'NVIDIA B200 SXM6 192GB (Dublin-Maint-02)',
    chip: 'NVIDIA B200 SXM6',
    architecture: 'Blackwell GB200',
    memoryGb: 192,
    memoryType: 'HBM3e',
    memoryBandwidthGbps: 8000,
    tflops: 4500,
    hourlyRateCents: 510,
    status: 'maintenance',
    region: 'eu-west-ie',
    pciGen: 'NVLink 5.0 (1.8 TB/s)',
    hostCpu: 'Dual AMD EPYC 9754',
    hostRamGb: 1024,
    storageNvmeGb: 7680,
    tdpWatts: 1000,
    provider: {
      name: 'Digital Realty Dublin DUB10',
      tier: 'Tier IV',
      uptime90d: 99.90,
      renewableEnergy: true,
    },
    tags: ['Under Maintenance', 'InfiniBand Firmware Flash', 'Blackwell'],
  },
  {
    id: 'node-23',
    slug: 'a100-sxm4-singapore-23',
    name: 'NVIDIA A100 SXM4 40GB (Singapore-Decom-01)',
    chip: 'NVIDIA A100 SXM4',
    architecture: 'Ampere GA100',
    memoryGb: 40,
    memoryType: 'HBM2',
    memoryBandwidthGbps: 1555,
    tflops: 312,
    hourlyRateCents: 110,
    status: 'retired',
    region: 'ap-southeast-sg',
    pciGen: 'NVLink 3.0',
    hostCpu: 'Intel Xeon Gold 6248',
    hostRamGb: 256,
    storageNvmeGb: 960,
    tdpWatts: 400,
    provider: {
      name: 'Singtel DataVault Tuas',
      tier: 'Tier III',
      uptime90d: 99.85,
      renewableEnergy: false,
    },
    tags: ['Decommissioned', 'Replaced with L40S Cluster'],
  },
  {
    id: 'node-24',
    slug: 'rtx4090-ashburn-24',
    name: 'NVIDIA RTX 4090 24GB (Ashburn-Legacy-Decom)',
    chip: 'NVIDIA RTX 4090',
    architecture: 'Ada Lovelace AD102',
    memoryGb: 24,
    memoryType: 'GDDR6X',
    memoryBandwidthGbps: 1008,
    tflops: 1321,
    hourlyRateCents: 70,
    status: 'retired',
    region: 'us-east-va',
    pciGen: 'PCIe 4.0 x16',
    hostCpu: 'AMD Ryzen 9 7900X',
    hostRamGb: 64,
    storageNvmeGb: 1000,
    tdpWatts: 450,
    provider: {
      name: 'Equinix Metal Ashburn DC2',
      tier: 'Tier III',
      uptime90d: 99.80,
      renewableEnergy: true,
    },
    tags: ['Decommissioned', 'Hardware Reallocation Pending'],
  },
];

// Pre-compute 30 days of 720 hourly samples deterministically for all 24 listings
export const MOCK_LISTINGS: Listing[] = RAW_LISTINGS.map((raw) => {
  const { samples, currentUtil, currentPower } = generateDeterministicSamples(
    raw.id,
    raw.tdpWatts,
    raw.status
  );

  return {
    ...raw,
    currentUtilization: currentUtil,
    currentPowerWatts: currentPower,
    utilizationSamples: samples,
  };
});

export function getListingBySlug(slug: string): Listing | undefined {
  return MOCK_LISTINGS.find((l) => l.slug === slug);
}

export function getListingById(id: string): Listing | undefined {
  return MOCK_LISTINGS.find((l) => l.id === id);
}
