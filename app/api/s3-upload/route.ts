export async function POST(request: Request) {
  return new Response(
    JSON.stringify({
      message: "S3 upload functionality is not implemented in this version"
    }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
}
