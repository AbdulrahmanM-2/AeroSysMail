
export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(process.env.BACKEND_URL + "/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.INTERNAL_API_KEY!
    },
    body: JSON.stringify(body)
  });

  return Response.json(await res.json());
}
