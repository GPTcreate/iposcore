export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  const content = 'google.com, pub-4909665367366825, DIRECT, f08c47fec0942fa0\n';

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
