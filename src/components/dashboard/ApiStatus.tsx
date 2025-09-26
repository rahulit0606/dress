import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Wifi, Zap, MessageSquare, CreditCard } from 'lucide-react';
import { checkApiStatus } from '../../lib/api';

const ApiStatus = () => {
  const [status, setStatus] = useState({
    supabase: false,
    virtualTryOn: false,
    whatsapp: false,
    payment: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const apiStatus = await checkApiStatus();
        setStatus(apiStatus);
      } catch (error) {
        console.error('Error checking API status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  const apis = [
    {
      name: 'Database (Supabase)',
      key: 'supabase' as keyof typeof status,
      icon: Wifi,
      description: 'User data, dresses, customers',
      required: true
    },
    {
      name: 'Virtual Try-On AI',
      key: 'virtualTryOn' as keyof typeof status,
      icon: Zap,
      description: 'AI-powered dress fitting',
      required: true
    },
    {
      name: 'WhatsApp Business',
      key: 'whatsapp' as keyof typeof status,
      icon: MessageSquare,
      description: 'Customer campaigns',
      required: false
    },
    {
      name: 'Payment Processing',
      key: 'payment' as keyof typeof status,
      icon: CreditCard,
      description: 'Subscription billing',
      required: false
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Connections</h3>
      
      <div className="space-y-4">
        {apis.map((api) => {
          const isConnected = status[api.key];
          const Icon = api.icon;
          
          return (
            <div key={api.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Icon className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{api.name}</h4>
                    {api.required && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{api.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!status.supabase && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">Database Connection Required</p>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Your Supabase database is not connected. Please check your environment variables.
          </p>
        </div>
      )}

      {!status.virtualTryOn && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">AI Service Needed</p>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Connect an AI service like Replicate or RunwayML for virtual try-on functionality.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiStatus;