import React from 'react';
import { VideoDescription } from '../services/geminiService';
import { DocumentTextIcon, LocationIcon, TagIcon, ListIcon } from './icons';

interface DescriptionDisplayProps {
  description: VideoDescription;
}

export const DescriptionDisplay: React.FC<DescriptionDisplayProps> = ({ description }) => {
  return (
    <div className="text-gray-300 space-y-8 leading-relaxed animate-fade-in">
        {/* Summary */}
        {description.summary && (
            <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Summary
                </h3>
                <p>{description.summary}</p>
            </div>
        )}

        {/* Setting */}
        {description.setting && (
            <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center">
                <LocationIcon className="h-5 w-5 mr-2" />
                Setting
                </h3>
                <p>{description.setting}</p>
            </div>
        )}

        {/* Key Elements */}
        {description.keyElements && description.keyElements.length > 0 && (
            <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Key Elements
                </h3>
                <div className="flex flex-wrap gap-2">
                {description.keyElements.map((element, index) => (
                    <span key={index} className="bg-gray-700 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full transition-colors hover:bg-gray-600 hover:text-indigo-200">
                    {element}
                    </span>
                ))}
                </div>
            </div>
        )}

        {/* Sequence of Events */}
        {description.sequenceOfEvents && description.sequenceOfEvents.length > 0 && (
            <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center">
                <ListIcon className="h-5 w-5 mr-2" />
                Sequence of Events
                </h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                {description.sequenceOfEvents.map((event, index) => (
                    <li key={index}>{event}</li>
                ))}
                </ol>
            </div>
        )}
       <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};