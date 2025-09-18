// API Configuration and Status
import { supabase } from '../contexts/AuthContext';
import { processVirtualTryOn, checkVirtualTryOnStatus, VirtualTryOnRequest } from './virtualTryOn';

// ✅ CONNECTED: Supabase Database API
export const supabaseApi = {
  // Authentication
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  
  // Database operations
  getDresses: (showroomId: string) => supabase.from('dresses').select('*').eq('showroom_id', showroomId),
  getCustomers: (showroomId: string) => supabase.from('customers').select('*').eq('showroom_id', showroomId),
  getAnalytics: (showroomId: string) => supabase.from('analytics_events').select('*').eq('showroom_id', showroomId),
};

// ✅ CONNECTED: Virtual Try-On AI API (Replicate)
export const virtualTryOnApi = {
  processVirtualTryOn: async (request: VirtualTryOnRequest) => {
    return await processVirtualTryOn(request);
  },
  checkStatus: async () => {
    return await checkVirtualTryOnStatus();
  }
};

// ❌ NOT CONNECTED: WhatsApp Business API
export const whatsappApi = {
  sendCampaign: async (customers: string[], message: string) => {
    // TODO: Implement WhatsApp Business API
    console.log('WhatsApp API not implemented yet');
    return { error: 'WhatsApp API not connected' };
  }
};

// ❌ NOT CONNECTED: Payment Processing API
export const paymentApi = {
  createSubscription: async (plan: string) => {
    // TODO: Implement Stripe/Razorpay
    console.log('Payment API not implemented yet');
    return { error: 'Payment API not connected' };
  }
};

// API Status Check
export const checkApiStatus = async () => {
  const status = {
    supabase: false,
    virtualTryOn: await checkVirtualTryOnStatus(),
    whatsapp: false,
    payment: false
  };

  try {
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession();
    status.supabase = !error;
  } catch (error) {
    console.error('Supabase connection failed:', error);
  }

  return status;
};