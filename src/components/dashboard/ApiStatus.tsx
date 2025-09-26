@@ .. @@
   useEffect(() => {
     const loadStatus = async () => {
       try {
-        const apiStatus = await checkApiStatus();
-        setStatus(apiStatus);
+        // Check Supabase connection
+        const supabaseConnected = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
+        
+        // Check Replicate connection
+        const replicateConnected = !!import.meta.env.VITE_REPLICATE_API_TOKEN;
+        
+        setStatus({
+          supabase: supabaseConnected,
+          virtualTryOn: replicateConnected,
+          whatsapp: false,
+          payment: false
+        });
       } catch (error) {
         console.error('Error checking API status:', error);
       } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);