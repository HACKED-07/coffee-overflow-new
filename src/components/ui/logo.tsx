import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center shadow-lg`}>
        <div className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-10 h-10'} bg-white rounded-full flex items-center justify-center`}>
          <div className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-8 h-8'} bg-gradient-to-br from-blue-500 to-green-600 rounded-full relative`}>
            {/* Water droplet base */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            {/* Green leaf */}
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1 h-1' : 'w-2 h-2'} absolute top-0 right-0 bg-green-500 rounded-full transform rotate-45`}></div>
            {/* White V shape */}
            <div className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} absolute bottom-0 left-0 bg-white rounded-full transform rotate-180`}></div>
          </div>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <h1 className={`font-bold text-gray-900 ${textSizes[size]}`}>
          <span className="text-blue-600">Gre</span>
          <span className="text-green-600">vi</span>
        </h1>
      )}
    </div>
  );
};

export default Logo;
