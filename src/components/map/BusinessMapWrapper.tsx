"use client";

import dynamic from "next/dynamic";

const BusinessMap = dynamic(
  () => import("@/components/map/BusinessMap"),
  { ssr: false }
);

interface BusinessMapWrapperProps {
  latitude: number;
  longitude: number;
  businessName: string;
  address?: string | null;
}

export default function BusinessMapWrapper(props: BusinessMapWrapperProps) {
  return <BusinessMap {...props} />;
}
