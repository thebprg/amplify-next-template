import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { redirect } from "next/navigation";

// Configure Amplify for Server Side
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default async function ShortUrlRedirect({ params }: { params: { shortCode: string } }) {
  const { shortCode } = params;

  try {
    const { data: urls } = await client.models.Url.list({
      filter: {
        shortCode: {
          eq: shortCode
        }
      },
      authMode: 'apiKey' 
    });

    if (urls.length > 0) {
      const url = urls[0];

      // Check Prior Expiration
      if (url.expiration) {
        const now = Math.floor(Date.now() / 1000);
        if (now > url.expiration) {
           return (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', fontFamily: 'system-ui, sans-serif' }}>
                 <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>Link Expired</h1>
                 <p>This shortened URL is no longer active.</p>
             </div>
           );
        }
      }

      // Increment Clicks (Fire and forget, but await to ensure it runs before redirect kills context if needed)
      // In server components, we must await side effects or offload them.
      // Increment Clicks (Fire and forget, but await to ensure it runs before redirect kills context if needed)
      // In server components, we must await side effects or offload them.
      try {
         await client.mutations.incrementClicks({
            urlId: url.id
         }, { authMode: 'apiKey' });
      } catch (e) {
         // Silently fail click tracking if public auth has issues, don't block redirect
         console.warn("Click tracking failed", e);
      }

      // Server Side Redirect
      redirect(url.originalUrl);
    } 
    
    // 404 Case
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <h1>404 - URL Not Found</h1>
      </div>
    );

  } catch (err: any) {
    console.error("Redirect Error:", err);
    // If it's a redirect error (NEXT_REDIRECT), rethrow it as Next.js expects
    if (err.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
    }
    return <div>Error processing request</div>;
  }
}
