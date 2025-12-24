"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@aws-amplify/ui-react/styles.css";

function LoginRedirect() {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return null;
}

export default function LoginPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 80px)', // Account for navbar
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ padding: '2rem', background: 'white' }}>
        <h2 style={{ 
          marginBottom: '2rem', 
          textAlign: 'center', 
          fontSize: '1.5rem', 
          color: 'var(--text-primary)' 
        }}>
          Welcome Back
        </h2>
        <Authenticator>
          <LoginRedirect />
        </Authenticator>
      </div>
    </div>
  );
}
