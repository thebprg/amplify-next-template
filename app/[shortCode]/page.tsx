"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function ShortUrlRedirect({ params }: { params: { shortCode: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function redirect() {
      try {
        const { data: urls } = await client.models.Url.list({
          filter: {
            shortCode: {
              eq: params.shortCode
            }
          },
          authMode: 'apiKey' // Use public access for redirection
        });

        if (urls.length > 0) {
          const url = urls[0];
          
          // Check expiration
          if (url.expiration) {
            // Compare current time (seconds) with expiration (seconds)
            const now = Math.floor(Date.now() / 1000);
            if (now > url.expiration) {
               setExpired(true);
               setLoading(false);
               return;
            }
          }

          // Simple increment (best effort)
          // Note: Public update might be blocked depending on strict schema rules, 
          // but we prioritized redirect.
          try {
             await client.models.Url.update({
                id: url.id,
                clicks: (url.clicks || 0) + 1
             }, { authMode: 'apiKey' });
          } catch (e) {
             // Ignore click update failure for public users
          }

          window.location.href = url.originalUrl;
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    redirect();
  }, [params.shortCode]);

  if (loading) return <div>Redirecting...</div>;
  if (expired) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>Link Expired</h1>
        <p>This shortened URL is no longer active.</p>
    </div>
  );
  if (error) return <div>404 - URL Not Found</div>;

  return null;
}
