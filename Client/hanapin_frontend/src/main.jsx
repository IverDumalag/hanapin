import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';  


const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);