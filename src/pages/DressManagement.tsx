import React, { useState } from 'react';
import { Plus, Search, Filter, Upload, Download, MoreVertical } from 'lucide-react';

const DressManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const dresses = [
    {
      id: 1,
      name: 'Elegant Evening Gown',
      category: 'Evening Wear',
      price: 299,
      size: 'S, M, L',
      color: 'Black',
      status: 'active',
      tryOns: 124,
      image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=300'
    },
    {
      id: 2,
      name: 'Floral Summer Dress',
      category: 'Casual',
      price: 149,
      size: 'XS, S, M, L, XL',
      color: 'Multi',
      status: 'active',
      tryOns: 98,
      image: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?w=300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dress Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your dress catalog, add new items, and track performance.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Dress</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search dresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="evening">Evening Wear</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="party">Party</option>
            </select>
            
            <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dresses.map((dress) => (
          <div key={dress.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-3 aspect-h-4 relative">
              <img 
                src={dress.image} 
                alt={dress.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <button className="bg-white rounded-full p-1 shadow-sm hover:bg-gray-50">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  dress.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {dress.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{dress.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{dress.category}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">${dress.price}</span>
                <span className="text-sm text-gray-600">{dress.tryOns} try-ons</span>
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <p><span className="font-medium">Sizes:</span> {dress.size}</p>
                <p><span className="font-medium">Color:</span> {dress.color}</p>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                  Edit
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                  View Stats
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for when no dresses match filters */}
      {dresses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dresses found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first dress to the catalog.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Add Your First Dress
          </button>
        </div>
      )}
    </div>
  );
};

export default DressManagement;