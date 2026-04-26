"use client";

import dynamic from "next/dynamic";
import type { BusinessPin } from "./AllBusinessesMap";

const AllBusinessesMap = dynamic(
  () => import("@/components/map/AllBusinessesMap"),
  { ssr: false }
);

interface AllBusinessesMapWrapperProps {
  businesses: BusinessPin[];
}

export default function AllBusinessesMapWrapper({ businesses }: AllBusinessesMapWrapperProps) {
  return <AllBusinessesMap businesses={businesses} />;
}
