import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MOCK_LISTINGS, getListingBySlug } from '@/data/mockListings';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';
import { ListingDetailSkeleton } from '@/components/ui/Skeletons';
import type { Metadata } from 'next';

// All slug paths are statically pre-generated — params access is safe; opt out of instant-navigation warning.
export const instant = false;

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_LISTINGS.map((listing) => ({
    slug: listing.slug,
  }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    return {
      title: 'Node Not Found // SILICON EXCHANGE',
    };
  }

  return {
    title: `${listing.name} // SILICON EXCHANGE`,
    description: `Inspect telemetry, memory bandwidth, and spot reservation windows for ${listing.chip} in ${listing.region}.`,
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <Suspense fallback={<ListingDetailSkeleton />}>
      <ListingDetailClient listing={listing} />
    </Suspense>
  );
}
