import React, { useState } from 'react';
import { Plus, Search, Filter, Upload, Download, MoreVertical } from 'lucide-react';
import { useAuth, supabase } from '../contexts/AuthContext';
import { useEffect } from 'react';
import VirtualTryOnModal from '../components/VirtualTryOnModal';

const DressManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dresses, setDresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDress, setSelectedDress] = useState<any>(null);
  const [showTryOnModal, setShowTryOnModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadDresses();
    }
  }, [user]);

  const loadDresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dresses')
        .select('*')
        .eq('showroom_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading dresses:', error);
        setDresses([]);
      } else {
        setDresses(data || []);
      }
    } catch (error) {
      console.error('Error loading dresses:', error);
      setDresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDress = () => {
    // For now, show an alert. In a real app, this would open a modal or navigate to add dress page
    alert('Add dress functionality will be implemented. This connects to your Supabase database.');
  };

  const handleTryOnDress = (dress: any) => {
    setSelectedDress(dress);
    setShowTryOnModal(true);
  };

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
            <span onClick={handleAddDress}>Add Dress</span>
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
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dresses...</p>
        </div>
      ) : dresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dresses.map((dress) => (
            <div key={dress.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-w-3 aspect-h-4 relative">
                <img 
                  src={dress.image_urls?.[0] || 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?w=300'} 
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
                  <span className="text-sm text-gray-600">{dress.try_on_count || 0} try-ons</span>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="font-medium">Sizes:</span> {dress.sizes?.join(', ') || 'N/A'}</p>
                  <p><span className="font-medium">Colors:</span> {dress.colors?.join(', ') || 'N/A'}</p>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button 
                    onClick={() => handleTryOnDress(dress)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    Try On
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dresses found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first dress to the catalog.</p>
          <button 
            onClick={handleAddDress}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Add Your First Dress
          </button>
        </div>
      )}

      {/* Virtual Try-On Modal */}
      {selectedDress && (
        <VirtualTryOnModal
          isOpen={showTryOnModal}
          onClose={() => {
            setShowTryOnModal(false);
            setSelectedDress(null);
          }}
          dress={selectedDress}
        />
      )}
    </div>
  );
};

export default DressManagement;