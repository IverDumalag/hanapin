import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';  
import { Helmet } from 'react-helmet';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <StrictMode>
      <Helmet>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-Content-Type-Options" content="nosniff" />
        <meta http-equiv="X-Frame-Options" content="DENY" />
        <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'none';" />
      </Helmet>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);
