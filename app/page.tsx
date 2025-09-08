"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { STLViewer } from "@/components/ui/stl-viewer";
import { M3DLogo } from "@/components/ui/m3d-logo";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedModel, setGeneratedModel] = useState<{
    stlUrl: string;
    stlFileName: string;
    imageUrl: string;
  } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [thumbnailUploadUrl, setThumbnailUploadUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    // Reset generated model when new file is selected
    if (file && generatedModel) {
      setGeneratedModel(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setGeneratedModel(null);
    setIsProcessing(false);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && !isProcessing) {
      console.log("Processing file:", selectedFile.name);
      setIsProcessing(true);
      setProgress(0);
      
      try {
        // Animate progress from 0 to 100 over 10 seconds
        const startTime = Date.now();
        const duration = 15000; // 10 seconds
        
        const updateProgress = () => {
          const elapsed = Date.now() - startTime;
          const newProgress = Math.min((elapsed / duration) * 100, 100);
          setProgress(newProgress);
          
          if (newProgress < 100) {
            requestAnimationFrame(updateProgress);
          }
        };
        
        requestAnimationFrame(updateProgress);

        // Create FormData and send to API
        const formData = new FormData();
        formData.append('image', selectedFile);

        console.log("🚀 Calling API to process 3D model...");
        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log("📊 API Response:", result);

        if (result.success && result.stlUrl) {
          console.log("✅ Processing successful! Displaying 3D model...");
          
          // Set the generated model data to display the 3D viewer
          setGeneratedModel({
            stlUrl: result.stlUrl,
            stlFileName: result.stlFileName,
            imageUrl: result.imageUrl
          });
          
          console.log("🎯 3D model ready for display");
        } else {
          console.error("❌ Processing failed:", result.error || 'Unknown error');
          alert('Processing failed: ' + (result.error || 'Unknown error'));
        }

      } catch (error) {
        console.error("❌ Error calling API:", error);
        alert('Error processing file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        // Reset after completion
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
        }, 500);
      }
    }
  };

  const handleCheckout = async () => {
    if (!generatedModel || isCheckingOut) return;
    try {
      setIsCheckingOut(true);
      console.log("🛒 Requesting Shopify checkout link...", generatedModel);
      const res = await fetch('/api/shopify-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stlUrl: generatedModel.stlUrl,
          stlFileName: generatedModel.stlFileName,
          imageUrl: generatedModel.imageUrl,
          thumbnailUrl: thumbnailUploadUrl || localStorage.getItem('m3d_thumbnail_url') || ''
        })
      });
      const data = await res.json();
      console.log("🧾 Checkout API response:", data);
      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to create checkout');
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('❌ Checkout error:', err);
      alert('Failed to start checkout: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Title */}
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            model3d.me
          </h1>
          
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <label htmlFor="avatar-upload" className="block text-sm font-medium text-foreground">
              Upload an avatar or picture of yourself
            </label>
            <FileUpload
              id="avatar-upload"
              accept="image/*"
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              generatedModel={generatedModel}
              onThumbnailReady={async (dataUrl) => {
                try {
                  setThumbnailDataUrl(dataUrl);
                  localStorage.setItem('m3d_thumbnail_data', dataUrl);
                  const res = await fetch('/api/upload-thumbnail', {
                    method: 'POST',
                    body: (() => {
                      const fd = new FormData();
                      // Convert data URL to File
                      const arr = dataUrl.split(',');
                      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                      const bstr = atob(arr[1]);
                      let n = bstr.length;
                      const u8arr = new Uint8Array(n);
                      while (n--) u8arr[n] = bstr.charCodeAt(n);
                      const file = new File([u8arr], 'thumbnail.png', { type: mime });
                      fd.append('image', file);
                      return fd;
                    })()
                  });
                  const json = await res.json();
                  if (json.success && json.url) {
                    setThumbnailUploadUrl(json.url);
                    localStorage.setItem('m3d_thumbnail_url', json.url);
                  } else {
                    console.error('❌ Thumbnail upload failed:', json.error);
                  }
                } catch (e) {
                  console.error('❌ Error preparing thumbnail upload:', e);
                }
              }}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="text-left w-full space-y-3">
            {isProcessing ? (
              <div className="w-full relative overflow-hidden appearance-none bg-[#466F80] border border-[rgba(27,31,35,.15)] text-white cursor-default font-semibold leading-5 text-center no-underline select-none touch-manipulation align-middle whitespace-nowrap shadow-[rgba(27,31,35,.1)_0_1px_0] rounded-md text-base px-6 h-[36px]">
                {/* Progress fill */}
                <div 
                  className="absolute inset-0 bg-[#3a5a6b] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : generatedModel ? (
              /* Checkout and Generate New Buttons */
              <div className="space-y-3">
                <Button 
                  className="w-full text-base font-semibold px-6 py-3 flex items-center justify-center gap-2"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  Make it real with <M3DLogo className="text-white -mr-1 -ml-1" width={20} height={22} /> M3D  - $15
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedModel.stlUrl;
                      link.download = generatedModel.stlFileName;
                      link.click();
                    }}
                    className="flex-1 text-sm"
                  >
                    Download STL
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleReset}
                    className="flex-1 text-sm"
                  >
                    Generate New
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground leading-snug">
                  No refunds for models that are not correct. Please verify your model before buying.
                </p>
              </div>
            ) : (
              /* Initial Generate Button */
              <Button 
                type="submit" 
                disabled={!selectedFile}
                className="w-full text-base font-semibold px-6 py-3"
              >
                Generate 3D Model
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
