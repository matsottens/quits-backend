import axios from 'axios';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
}

export interface GoogleAuthResponse {
  user: GoogleUserInfo;
  access_token: string;
  refresh_token: string;
}

export const initiateGoogleAuth = () => {
  const params = new URLSearchParams({
    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const handleGoogleCallback = async (code: string): Promise<GoogleAuthResponse> => {
  try {
    console.log('GoogleAuth - Starting token exchange');
    console.log('GoogleAuth - Using redirect URI:', process.env.REACT_APP_GOOGLE_REDIRECT_URI);
    
    // Exchange code for tokens
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    console.log('GoogleAuth - Token exchange successful');
    const { access_token, refresh_token } = tokenResponse.data;

    // Get user info
    console.log('GoogleAuth - Fetching user info');
    const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('GoogleAuth - User info received:', {
      email: userInfoResponse.data.email,
      name: userInfoResponse.data.name
    });

    // Store tokens securely (you might want to use a more secure method)
    localStorage.setItem('google_access_token', access_token);
    localStorage.setItem('google_refresh_token', refresh_token);

    return {
      user: userInfoResponse.data,
      access_token,
      refresh_token
    };
  } catch (error: any) {
    console.error('GoogleAuth - Error in callback handling:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const refreshGoogleToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const { access_token } = response.data;
    localStorage.setItem('google_access_token', access_token);

    return access_token;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return localStorage.getItem('google_access_token');
};

export const getGoogleRefreshToken = (): string | null => {
  return localStorage.getItem('google_refresh_token');
};

export const logoutGoogle = () => {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
}; 