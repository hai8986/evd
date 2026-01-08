import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
    try {
        const formData = await req.formData();
        const image = formData.get("image");

        if (!image) {
            return new Response("Image missing", { status: 400 });
        }

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
            return new Response("remove.bg failed", { status: 500 });
        }

        return new Response(await response.arrayBuffer(), {
            headers: {
                "Content-Type": "image/png",
            },
        });
    } catch (err) {
        console.error(err);
        return new Response("Server error", { status: 500 });
    }
});
