'use server';

export async function validateUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'URL-Shortener-Bot/1.0' // Polite UA
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        // Some sites allow GET but not HEAD, try GET as fallback if HEAD fails method not allowed
        if (response.status === 405) {
             const controllerGet = new AbortController();
             const timeoutGet = setTimeout(() => controllerGet.abort(), 5000);
             const responseGet = await fetch(url, {
                method: 'GET',
                signal: controllerGet.signal,
                headers: { 'Range': 'bytes=0-10' } // Try to get just small separate chunk
             });
             clearTimeout(timeoutGet);
             if (responseGet.ok) return { isValid: true };
        }
        
        return { isValid: false, error: `URL returned status ${response.status}` };
    }

    return { isValid: true };
  } catch (error: any) {
    console.error("URL Validation Error:", error);
    return { isValid: false, error: "URL is unreachable or timed out." };
  }
}
