import React from 'react';
import { DocumentTextIcon, LocationIcon, TagIcon, ListIcon } from './icons';

export const DescriptionSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse p-4">
      {/* Summary Skeleton */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-400/50 mb-3 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Summary
        </h3>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>

      {/* Setting Skeleton */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-400/50 mb-3 flex items-center">
          <LocationIcon className="h-5 w-5 mr-2" />
          Setting
        </h3>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      {/* Key Elements Skeleton */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-400/50 mb-3 flex items-center">
          <TagIcon className="h-5 w-5 mr-2" />
          Key Elements
        </h3>
        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-24 bg-gray-700 rounded-full"></div>
          <div className="h-7 w-32 bg-gray-700 rounded-full"></div>
          <div className="h-7 w-28 bg-gray-700 rounded-full"></div>
          <div className="h-7 w-20 bg-gray-700 rounded-full"></div>
        </div>
      </div>

      {/* Sequence of Events Skeleton */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-400/50 mb-3 flex items-center">
          <ListIcon className="h-5 w-5 mr-2" />
          Sequence of Events
        </h3>
        <div className="space-y-3">
            <div className="flex items-start space-x-2">
                <div className="h-4 w-4 bg-gray-700 rounded mt-1"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
             <div className="flex items-start space-x-2">
                <div className="h-4 w-4 bg-gray-700 rounded mt-1"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
             <div className="flex items-start space-x-2">
                <div className="h-4 w-4 bg-gray-700 rounded mt-1"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
        </div>
      </div>
    </div>
  );
};
