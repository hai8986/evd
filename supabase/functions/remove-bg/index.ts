import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return new Response(JSON.stringify({ error: "Image missing" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Received image, calling remove.bg API...");

    const removeBgForm = new FormData();
    removeBgForm.append("image_file", image);
    removeBgForm.append("size", "auto");

    const response = await fetch(
      "https://api.remove.bg/v1.0/removebg",
      {
        method: "POST",
        headers: {
          "X-Api-Key": Deno.env.get("REMOVE_BG_API_KEY")!,
        },
        body: removeBgForm,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("remove.bg error:", err);
      return new Response(JSON.stringify({ error: "remove.bg failed", details: err }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Background removed successfully");

    return new Response(await response.arrayBuffer(), {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Server error", details: errorMessage }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
