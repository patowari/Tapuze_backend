import React from 'react';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface InfoBannerProps {
  children: React.ReactNode;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ children }) => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
