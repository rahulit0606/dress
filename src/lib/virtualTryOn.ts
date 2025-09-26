@@ .. @@
 // Initialize Replicate client
 const replicate = new Replicate({
-  auth: import.meta.env.VITE_REPLICATE_API_TOKEN || '',
+  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
 });
 
 export interface VirtualTryOnRequest {