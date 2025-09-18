import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shirt, 
  TrendingUp, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import TopDresses from '../components/dashboard/TopDresses';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDresses: 0,
    totalCustomers: 0,
    totalTryOns: 0,
    conversionRate: 0
  });
  
  const [recentStats, setRecentStats] = useState({
    dressesChange: 12,
    customersChange: 8,
    tryOnsChange: 24,
    conversionChange: 5
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Fetch real data from Supabase
      const [dressesResult, customersResult, tryOnsResult] = await Promise.all([
        supabase.from('dresses').select('id').eq('showroom_id', user?.id),
        supabase.from('customers').select('id').eq('showroom_id', user?.id),
        supabase.from('try_ons').select('id').eq('showroom_id', user?.id)
      ]);

      const totalDresses = dressesResult.data?.length || 0;
      const totalCustomers = customersResult.data?.length || 0;
      const totalTryOns = tryOnsResult.data?.length || 0;
      const conversionRate = totalTryOns > 0 ? ((totalCustomers / totalTryOns) * 100) : 0;

      setStats({
        totalDresses,
        totalCustomers,
        totalTryOns,
        conversionRate: Math.round(conversionRate * 10) / 10
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use fallback data if database query fails
      setStats({
        totalDresses: 0,
        totalCustomers: 0,
        totalTryOns: 0,
        conversionRate: 0
      });
    }
  };

  const chartData = [
    { name: 'Mon', tryOns: 45, conversions: 8 },
    { name: 'Tue', tryOns: 52, conversions: 12 },
    { name: 'Wed', tryOns: 48, conversions: 9 },
    { name: 'Thu', tryOns: 61, conversions: 15 },
    { name: 'Fri', tryOns: 55, conversions: 11 },
    { name: 'Sat', tryOns: 67, conversions: 18 },
    { name: 'Sun', tryOns: 58, conversions: 14 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.showroom_name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your showroom today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dresses"
          value={stats.totalDresses}
          change={recentStats.dressesChange}
          changeType="increase"
          icon={Shirt}
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={recentStats.customersChange}
          changeType="increase"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Try-Ons Today"
          value={stats.totalTryOns}
          change={recentStats.tryOnsChange}
          changeType="increase"
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change={recentStats.conversionChange}
          changeType="increase"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Try-Ons & Conversions"
            subtitle="Weekly overview"
            data={chartData}
          />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Top Dresses and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDresses />
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                    Add New Dress
                  </h4>
                  <p className="text-sm text-gray-500">
                    Upload a new dress to your catalog
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </div>
            </button>

            <button className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-green-700">
                    Bulk Upload
                  </h4>
                  <p className="text-sm text-gray-500">
                    Upload multiple dresses via CSV
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
              </div>
            </button>

            <button className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-purple-700">
                    Campaign Manager
                  </h4>
                  <p className="text-sm text-gray-500">
                    Send WhatsApp campaigns to customers
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;