import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Loader2, Download, Share2 } from 'lucide-react';
import { virtualTryOnApi } from '../lib/api';
import { useAuth, supabase } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  dress: {
    id: string;
    name: string;
    image_urls: string[];
    price: number;
  };
}

const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ isOpen, onClose, dress }) => {
  const { user } = useAuth();
  const [customerImage, setCustomerImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (imageData: string): Promise<string> => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `customer-images/${user?.id}/${Date.now()}.jpg`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('try-on-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('try-on-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleVirtualTryOn = async () => {
    if (!customerImage || !user) {
      toast.error('Please upload your photo first');
      return;
    }

    setProcessing(true);
    setStep('processing');

    try {
      // Upload customer image to Supabase storage
      const customerImageUrl = await uploadImageToSupabase(customerImage);
      
      // Get dress image URL
      const dressImageUrl = dress.image_urls[0];

      // Process virtual try-on
      const result = await virtualTryOnApi.processVirtualTryOn({
        customerImageUrl,
        dressImageUrl,
        showroomId: user.id,
        dressId: dress.id,
        sessionId: `session_${Date.now()}`
      });

      if (result.success && result.resultImageUrl) {
        setResultImage(result.resultImageUrl);
        setStep('result');
        
        // Save try-on record to database
        await supabase.from('try_ons').insert({
          showroom_id: user.id,
          dress_id: dress.id,
          customer_image_url: customerImageUrl,
          result_image_url: result.resultImageUrl,
          processing_status: 'completed',
          session_id: `session_${Date.now()}`
        });

        toast.success('Virtual try-on completed!');
      } else {
        throw new Error(result.error || 'Virtual try-on failed');
      }
    } catch (error) {
      console.error('Virtual try-on error:', error);
      toast.error(error instanceof Error ? error.message : 'Virtual try-on failed');
      setStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `virtual-tryon-${dress.name}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Virtual Try-On: ${dress.name}`,
          text: `Check out how I look in this ${dress.name}!`,
          url: resultImage
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(resultImage);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const resetModal = () => {
    setCustomerImage(null);
    setResultImage(null);
    setStep('upload');
    setProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Virtual Try-On</h3>
              <p className="text-sm text-gray-600">{dress.name} - ${dress.price}</p>
            </div>
            <button
              onClick={() => {
                onClose();
                resetModal();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {step === 'upload' && (
              <>
                {/* Dress Preview */}
                <div className="flex justify-center">
                  <img
                    src={dress.image_urls[0]}
                    alt={dress.name}
                    className="w-32 h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>

                {/* Customer Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your Photo
                  </label>
                  
                  {!customerImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload your photo
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB. For best results, use a clear full-body photo.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={customerImage}
                        alt="Customer"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setCustomerImage(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Try-On Button */}
                {customerImage && (
                  <button
                    onClick={handleVirtualTryOn}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Virtual Try-On
                  </button>
                )}
              </>
            )}

            {step === 'processing' && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Your Virtual Try-On
                </h3>
                <p className="text-gray-600">
                  Our AI is working its magic... This usually takes 30-60 seconds.
                </p>
              </div>
            )}

            {step === 'result' && resultImage && (
              <>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Here's how you look!
                  </h3>
                  <img
                    src={resultImage}
                    alt="Virtual try-on result"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Try Another
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;