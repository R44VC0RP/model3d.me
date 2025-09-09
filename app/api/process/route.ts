import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@gradio/client";
import { utapi } from "@/server/uploadthing";

export async function POST(request: NextRequest) {
  console.log("🚀 Starting 3D model processing...");
  
  try {
    // Parse the uploaded file
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No image file provided'
      }, { status: 400 });
    }

    console.log("📁 Received file:", file.name, "Size:", file.size, "Type:", file.type);

    // Upload image to UploadThing first
    console.log("📤 Uploading image to UploadThing...");
    const uploadResult = await utapi.uploadFiles(file);
    
    if (!uploadResult.data) {
      console.error("❌ UploadThing upload failed:", uploadResult.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload image: ' + uploadResult.error?.message
      }, { status: 500 });
    }

    console.log("✅ Image uploaded to UploadThing:", uploadResult.data.url);

    // Connect to the Gradio client
    console.log("📡 Connecting to Hunyuan3D-2 client...");
    // const client = await Client.connect("tencent/Hunyuan3D-2");
    const client = await Client.connect("tencent/Hunyuan3D-2mini-Turbo");
    console.log("✅ Client connected successfully");
    
    console.log("🎯 Step 1: Starting shape generation with uploaded image...");
    
    // Download the image from UploadThing and create a proper File object for Gradio
    console.log("📥 Downloading image from UploadThing for Gradio...");
    const imageResponse = await fetch(uploadResult.data.url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from UploadThing: ${imageResponse.statusText}`);
    }
    
    const imageBlob = await imageResponse.blob();
    const imageFile = new File([imageBlob], uploadResult.data.name, { type: file.type });
    
    console.log("📁 Image file prepared for Gradio:", imageFile.name, imageFile.size, "bytes");
    
    const shapeResult = await client.predict("/shape_generation", {
      caption: "",
      image: imageFile, // Use the actual File object
      mv_image_front: null,
      mv_image_back: null,
      mv_image_left: null,
      mv_image_right: null,
      steps: 30,
      guidance_scale: 5,
      seed: 1234,
      octree_resolution: 256,
      check_box_rembg: true,
      num_chunks: 8000,
      randomize_seed: true,
    });
    console.log("📊 Shape generation result:", JSON.stringify(shapeResult, null, 2));

    // Extract the generated GLB file info from shape generation result
    const generatedFile = (shapeResult as any).data[0].value;
    console.log("📦 Generated file info:", JSON.stringify(generatedFile, null, 2));

    // Step 2: Export STL using the generated file
    console.log("📦 Step 2: Exporting STL file using generated GLB...");
    const exportStlResult = await client.predict("/on_export_click", {
      file_out: generatedFile, // Use the actual generated file
      file_out2: null,
      file_type: "stl",
      reduce_face: false,
      export_texture: false,
      target_face_num: 10000,
    });
    console.log("📊 STL export result:", JSON.stringify(exportStlResult, null, 2));

    // Extract the STL file URL from the export result
    const stlFile = (exportStlResult as any).data[1].value;
    const gradioStlUrl = stlFile.url;
    console.log("🎯 Gradio STL file URL:", gradioStlUrl);

    // Download the STL from Gradio and upload to UploadThing
    console.log("📥 Downloading STL from Gradio...");
    const stlResponse = await fetch(gradioStlUrl);
    if (!stlResponse.ok) {
      throw new Error(`Failed to download STL: ${stlResponse.statusText}`);
    }
    
    const stlBlob = await stlResponse.blob();
    console.log("📁 STL downloaded, size:", stlBlob.size, "bytes");

    // Create a File object for UploadThing
    const stlFileName = stlFile.orig_name || 'model.stl';
    const stlFileForUpload = new File([stlBlob], stlFileName, { type: 'application/octet-stream' });

    // Upload STL to UploadThing
    console.log("📤 Uploading STL to UploadThing...");
    const stlUploadResult = await utapi.uploadFiles(stlFileForUpload);
    
    if (!stlUploadResult.data) {
      console.error("❌ STL UploadThing upload failed:", stlUploadResult.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload STL: ' + stlUploadResult.error?.message
      }, { status: 500 });
    }

    console.log("✅ STL uploaded to UploadThing:", stlUploadResult.data.url);
    console.log("🎉 Processing completed successfully!");

    // Return the UploadThing STL URL for download
    return NextResponse.json({
      success: true,
      message: "3D model processing completed",
      stlUrl: stlUploadResult.data.url,
      stlFileName: stlUploadResult.data.name,
      imageUrl: uploadResult.data.url,
      results: {
        shapeGeneration: shapeResult,
        stlExport: exportStlResult
      }
    });

  } catch (error) {
    console.error("❌ Error during processing:", error);
    console.error("📍 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Process endpoint is ready. Send a POST request to start processing."
  });
}
