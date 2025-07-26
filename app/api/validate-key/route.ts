export async function POST(request: Request) {
  const { apiKey } = await request.json();

  if (!apiKey) {
    return new Response(JSON.stringify({ message: "API key is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Simple validation - just check if key exists and has reasonable length
    // In a real app, you would validate against your actual API provider
    if (apiKey && apiKey.length > 8) {
      return new Response(JSON.stringify({ message: "API key is valid" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("API key is too short or invalid");
    }
  } catch (error: any) {
    console.error("API key validation failed:", error);
    return new Response(
      JSON.stringify({ message: "API key is invalid", error: error.message }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
