import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log("🛒 Creating Shopify checkout...");
  
  try {
    const { stlUrl, stlFileName, imageUrl, thumbnailUrl } = await request.json();
    
    if (!stlUrl || !stlFileName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required STL data'
      }, { status: 400 });
    }

    // Shopify Admin API configuration
    const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    
    if (!shopDomain || !accessToken) {
      console.error("❌ Missing Shopify credentials");
      return NextResponse.json({
        success: false,
        error: 'Shopify configuration missing'
      }, { status: 500 });
    }

    // First, create a product with the thumbnail image
    console.log("🏗️ Creating Shopify product with thumbnail image...");
    const productData = {
      product: {
        title: `Custom 3D Model - ${stlFileName}`,
        body_html: `<p>Custom 3D model generated from user image.</p><p>STL file: ${stlFileName}</p>`,
        vendor: "Model3D.me",
        product_type: "3D Model",
        status: "active",
        images: thumbnailUrl ? [
          {
            src: thumbnailUrl,
            alt: `3D Model Preview - ${stlFileName}`
          }
        ] : [],
        variants: [
          {
            title: "Default",
            price: "7.00",
            inventory_management: null,
            inventory_policy: "continue",
            fulfillment_service: "manual",
            inventory_quantity: 1000,
            requires_shipping: true,
            taxable: true,
            weight: 0,
            weight_unit: "kg"
          }
        ],
        tags: "custom_3d_model, generated",
        metafields: [
          {
            namespace: "custom",
            key: "stl_url",
            value: stlUrl,
            type: "single_line_text_field"
          },
          {
            namespace: "custom", 
            key: "stl_filename",
            value: stlFileName,
            type: "single_line_text_field"
          },
          {
            namespace: "custom",
            key: "source_image_url", 
            value: imageUrl || "",
            type: "single_line_text_field"
          }
        ]
      }
    };

    console.log("📋 Product data:", JSON.stringify(productData, null, 2));

    const productResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/products.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(productData)
    });

    if (!productResponse.ok) {
      const errorData = await productResponse.text();
      console.error("❌ Product creation error:", productResponse.status, errorData);
      return NextResponse.json({
        success: false,
        error: `Product creation error: ${productResponse.status}`
      }, { status: 500 });
    }

    const product = await productResponse.json();
    const variantId = product.product.variants[0].id;
    console.log("✅ Product created with variant ID:", variantId);

    // Now create a draft order using the product variant
    const draftOrderData = {
      draft_order: {
        line_items: [
          {
            variant_id: variantId,
            quantity: 1
          }
        ],
        note: `Custom 3D model generated from user image. STL file: ${stlFileName}`,
        email: "", // Will be filled during checkout
        shipping_address: {}, // Will be filled during checkout
        billing_address: {}, // Will be filled during checkout
        tags: "custom_3d_model, generated",
        note_attributes: [
          {
            name: "STL Download URL",
            value: stlUrl
          },
          {
            name: "Original Filename", 
            value: stlFileName
          },
          {
            name: "Thumbnail URL",
            value: thumbnailUrl || ""
          }
        ]
      }
    };

    console.log("📋 Draft order data:", JSON.stringify(draftOrderData, null, 2));

    // Create draft order via Shopify Admin API
    const shopifyResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/draft_orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(draftOrderData)
    });

    if (!shopifyResponse.ok) {
      const errorData = await shopifyResponse.text();
      console.error("❌ Shopify API error:", shopifyResponse.status, errorData);
      return NextResponse.json({
        success: false,
        error: `Shopify API error: ${shopifyResponse.status}`
      }, { status: 500 });
    }

    const draftOrder = await shopifyResponse.json();
    console.log("✅ Draft order created:", draftOrder.draft_order.id);

    const checkoutUrl = draftOrder.draft_order.invoice_url;
    if (!checkoutUrl) {
      console.error("❌ Missing invoice_url on draft order");
      return NextResponse.json({
        success: false,
        error: 'Invoice URL not available on draft order'
      }, { status: 500 });
    }

    console.log("🎉 Checkout URL created:", checkoutUrl);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
      orderId: draftOrder.draft_order.id
    });

  } catch (error) {
    console.error("❌ Error creating Shopify checkout:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Shopify checkout endpoint is ready. Send a POST request with STL data."
  });
}
