import React from 'react';
import { TrendingUp, Eye, Heart } from 'lucide-react';

const topDresses = [
  {
    id: 1,
    name: 'Elegant Evening Gown',
    image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=200',
    tryOns: 124,
    wishlisted: 89,
    category: 'Evening Wear',
    trending: true
  },
  {
    id: 2,
    name: 'Floral Summer Dress',
    image: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?w=200',
    tryOns: 98,
    wishlisted: 67,
    category: 'Casual',
    trending: true
  },
  {
    id: 3,
    name: 'Business Professional',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=200',
    tryOns: 87,
    wishlisted: 54,
    category: 'Formal',
    trending: false
  },
  {
    id: 4,
    name: 'Bohemian Maxi',
    image: 'https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?w=200',
    tryOns: 76,
    wishlisted: 43,
    category: 'Casual',
    trending: false
  }
];

const TopDresses = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Dresses</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      
      <div className="space-y-4">
        {topDresses.map((dress, index) => (
          <div key={dress.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
              </div>
            </div>
            
            <div className="w-12 h-12 flex-shrink-0">
              <img 
                src={dress.image} 
                alt={dress.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {dress.name}
                </p>
                {dress.trending && (
                  <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500">{dress.category}</p>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{dress.tryOns}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{dress.wishlisted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors">
          Manage Dress Catalog
        </button>
      </div>
    </div>
  );
};

export default TopDresses;