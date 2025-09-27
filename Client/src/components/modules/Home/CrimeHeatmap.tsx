"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { MapPin } from "lucide-react";
import Image from "next/image";

import img from "@/src/assets/heatmap.jpg"

export default function CrimeHeatmap() {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-primary" />
          <h3 className="text-lg font-semibold">Crime Heatmap</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {/* Placeholder for map - you can integrate with Google Maps, Mapbox, etc. */}
        <div className="h-64  rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          {/* <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Interactive crime heatmap
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Coming soon...
            </p>
          </div> */}
          <Image alt="heatmap" src={img}/>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Crime Density
          </h4>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#f6b5b2] rounded" />
              <span className="text-gray-600 dark:text-gray-400">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#e66c62] rounded" />
              <span className="text-gray-600 dark:text-gray-400">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#cf3030] rounded" />
              <span className="text-gray-600 dark:text-gray-400">High</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
