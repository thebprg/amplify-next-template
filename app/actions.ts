'use server';

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { headers } from "next/headers";

// Configure Amplify for Server Side
Amplify.configure(outputs, { ssr: true });
const client = generateClient<Schema>();

// Simple in-memory rate limiting (resets on server restart)
// In production, use Redis or DynamoDB for persistent rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 URLs per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function generateShortCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

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

export async function createGuestUrl(originalUrl: string): Promise<{
  success: boolean;
  error?: string;
  url?: {
    id: string;
    shortCode: string;
    originalUrl: string;
    expiration: number;
  };
}> {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    
    // Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return { 
        success: false, 
        error: "Rate limit exceeded. Please try again later." 
      };
    }

    // Validate URL format
    let urlToShorten = originalUrl.trim();
    if (!/^https?:\/\//i.test(urlToShorten)) {
      urlToShorten = 'https://' + urlToShorten;
    }

    if (/^http:\/\//i.test(urlToShorten)) {
      return { success: false, error: "Insecure HTTP URLs not allowed. Use HTTPS." };
    }

    // Validate URL is reachable
    const { isValid, error } = await validateUrl(urlToShorten);
    if (!isValid) {
      return { success: false, error: error || "URL unreachable." };
    }

    // Generate short code
    const shortCode = generateShortCode();

    // Calculate expiration (3 months for guests)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);
    const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);

    // Create URL via Amplify (server-side, API key hidden)
    const { data: newUrl, errors } = await client.models.Url.create({
      originalUrl: urlToShorten,
      shortCode,
      clicks: 0,
      expiration: expirationTimestamp,
    }, { authMode: 'apiKey' });

    if (errors || !newUrl) {
      console.error("Create URL Error:", errors);
      return { success: false, error: "Failed to create short link." };
    }

    return {
      success: true,
      url: {
        id: newUrl.id,
        shortCode: newUrl.shortCode,
        originalUrl: newUrl.originalUrl,
        expiration: newUrl.expiration || expirationTimestamp,
      }
    };
  } catch (error: any) {
    console.error("Create Guest URL Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
