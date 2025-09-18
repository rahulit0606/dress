import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN || '',
});

export interface VirtualTryOnRequest {
  customerImageUrl: string;
  dressImageUrl: string;
  showroomId: string;
  customerId?: string;
  dressId: string;
  sessionId?: string;
}

export interface VirtualTryOnResult {
  success: boolean;
  resultImageUrl?: string;
  error?: string;
  processingId?: string;
}

// Virtual Try-On using Replicate's IDM-VTON model
export const processVirtualTryOn = async (request: VirtualTryOnRequest): Promise<VirtualTryOnResult> => {
  try {
    if (!import.meta.env.VITE_REPLICATE_API_TOKEN) {
      return {
        success: false,
        error: 'Replicate API token not configured. Please add VITE_REPLICATE_API_TOKEN to your environment variables.'
      };
    }

    console.log('Starting virtual try-on processing...', {
      customerImage: request.customerImageUrl,
      dressImage: request.dressImageUrl
    });

    // Use IDM-VTON model for virtual try-on
    const output = await replicate.run(
      "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      {
        input: {
          human_img: request.customerImageUrl,
          garm_img: request.dressImageUrl,
          garment_des: "dress", // Description of the garment
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42
        }
      }
    );

    console.log('Virtual try-on completed:', output);

    // The output is typically an array with the result image URL
    const resultImageUrl = Array.isArray(output) ? output[0] : output;

    if (!resultImageUrl) {
      return {
        success: false,
        error: 'No result image generated from AI model'
      };
    }

    return {
      success: true,
      resultImageUrl: resultImageUrl as string
    };

  } catch (error) {
    console.error('Virtual try-on error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during virtual try-on processing'
    };
  }
};

// Alternative models you can use:
export const alternativeModels = {
  // VITON-HD model (higher quality but slower)
  vitonHD: "replicate/viton-hd:0d2f9e5b8e8c4c8f8b8c4c8f8b8c4c8f8b8c4c8f",
  
  // OOTDiffusion (outfit of the day diffusion)
  ootDiffusion: "levihsu/ootdiffusion:0d2f9e5b8e8c4c8f8b8c4c8f8b8c4c8f8b8c4c8f",
  
  // Custom model (if you train your own)
  custom: "your-username/your-model:version-id"
};

// Batch processing for multiple try-ons
export const processBatchVirtualTryOn = async (requests: VirtualTryOnRequest[]): Promise<VirtualTryOnResult[]> => {
  const results = await Promise.allSettled(
    requests.map(request => processVirtualTryOn(request))
  );

  return results.map(result => 
    result.status === 'fulfilled' 
      ? result.value 
      : { success: false, error: 'Batch processing failed' }
  );
};

// Check if virtual try-on service is available
export const checkVirtualTryOnStatus = async (): Promise<boolean> => {
  try {
    if (!import.meta.env.VITE_REPLICATE_API_TOKEN) {
      return false;
    }

    // Test API connection by listing models
    await replicate.models.list();
    return true;
  } catch (error) {
    console.error('Virtual try-on service check failed:', error);
    return false;
  }
};