import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  color: 'teal' | 'blue' | 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color
}) => {
  const colorClasses = {
    teal: {
      bg: 'bg-teal-50',
      icon: 'bg-teal-100 text-teal-600',
      text: 'text-teal-700'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-700'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      text: 'text-amber-700'
    },
    rose: {
      bg: 'bg-rose-50',
      icon: 'bg-rose-100 text-rose-600',
      text: 'text-rose-700'
    }
  };
  
  return (
    <div className={`${colorClasses[color].bg} rounded-lg p-6 shadow-md`}>
      <div className="flex items-center">
        <div className={`${colorClasses[color].icon} p-3 rounded-full mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className={`text-2xl font-bold ${colorClasses[color].text}`}>{value}</p>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">dari bulan lalu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;