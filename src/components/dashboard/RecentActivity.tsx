import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'try-on',
    customer: 'Sarah Johnson',
    dress: 'Floral Summer Dress',
    time: '2 minutes ago',
    icon: Eye,
    color: 'text-blue-500'
  },
  {
    id: 2,
    type: 'wishlist',
    customer: 'Maria Garcia',
    dress: 'Elegant Evening Gown',
    time: '5 minutes ago',
    icon: Heart,
    color: 'text-red-500'
  },
  {
    id: 3,
    type: 'inquiry',
    customer: 'Jennifer Lee',
    dress: 'Casual Day Dress',
    time: '15 minutes ago',
    icon: ShoppingBag,
    color: 'text-green-500'
  },
  {
    id: 4,
    type: 'review',
    customer: 'Lisa Brown',
    dress: 'Formal Business Dress',
    time: '1 hour ago',
    icon: Star,
    color: 'text-yellow-500'
  },
  {
    id: 5,
    type: 'try-on',
    customer: 'Anna Wilson',
    dress: 'Bohemian Maxi Dress',
    time: '2 hours ago',
    icon: Eye,
    color: 'text-blue-500'
  }
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.customer}</span>{' '}
                {activity.type === 'try-on' && 'tried on'}
                {activity.type === 'wishlist' && 'added to wishlist'}
                {activity.type === 'inquiry' && 'inquired about'}
                {activity.type === 'review' && 'reviewed'}{' '}
                <span className="font-medium">{activity.dress}</span>
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
          View Activity Log
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;