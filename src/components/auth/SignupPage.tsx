import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#ffefd5',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
}));

const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '3rem',
});

const LogoIcon = styled(Box)({
  width: '2rem',
  height: '2rem',
  marginRight: '0.5rem',
  position: 'relative',
  '& > div': {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: '0.125rem',
    '& > div': {
      borderRadius: '50%',
      backgroundColor: 'rgba(148, 163, 184, 0.7)',
    },
  },
});

const LogoText = styled(Typography)({
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#1a365d',
  fontFamily: 'Playfair Display, serif',
});

const FormContainer = styled(Box)({
  width: '100%',
  maxWidth: '28rem',
  margin: '0 auto',
});

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '3.5rem',
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: '#e5e7eb',
    },
    '&:hover fieldset': {
      borderColor: '#d1d5db',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#1a365d',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1a365d',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: '3.5rem',
  backgroundColor: 'black',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  height: '3.5rem',
  backgroundColor: '#f3f4f6',
  color: 'black',
  borderColor: '#e5e7eb',
  '&:hover': {
    backgroundColor: '#e5e7eb',
  },
}));

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted with:', { email, password });
    // Navigate to onboarding after successful signup
    navigate('/onboarding');
  };

  const handleGoogleSignup = () => {
    // Implement Google signup
    console.log('Google signup clicked');
  };

  const handleOutlookSignup = () => {
    // Implement Outlook signup
    console.log('Outlook signup clicked');
  };

  return (
    <StyledContainer>
      {/* Status bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography sx={{ color: 'black', fontWeight: 500 }}>9:41</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Status bar icons */}
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Logo>
          <LogoIcon>
            <div>
              {Array(16).fill(0).map((_, i) => (
                <div key={i} />
              ))}
            </div>
          </LogoIcon>
          <LogoText>Quits</LogoText>
        </Logo>

        <FormContainer>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              color: '#1a365d',
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
              mb: 1,
            }}
          >
            Create an account
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#1a365d',
              mb: 4,
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            }}
          >
            Enter your email to sign up for this app
          </Typography>

          <StyledForm onSubmit={handleSubmit}>
            <StyledTextField
              label="Email"
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <StyledTextField
              label="Password"
              type="password"
              placeholder="Password123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <StyledButton type="submit" fullWidth>
              Continue
            </StyledButton>
          </StyledForm>

          <Typography
            sx={{
              textAlign: 'center',
              color: '#6b7280',
              mt: 3,
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            By clicking continue, you agree to our{' '}
            <Link to="#" style={{ color: 'black', fontWeight: 500 }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" style={{ color: 'black', fontWeight: 500 }}>
              Privacy Policy
            </Link>
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link to="/login" style={{ color: '#1a365d', fontWeight: 500, fontSize: '0.875rem' }}>
              Already have an account? Log in here.
            </Link>
          </Box>

          <Box sx={{ my: 4 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography sx={{ color: '#6b7280', px: 2 }}>or</Typography>
            </Divider>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SocialButton
              fullWidth
              variant="outlined"
              startIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                    fill="#1976D2"
                  />
                </svg>
              }
              onClick={handleGoogleSignup}
            >
              Continue with Gmail
            </SocialButton>

            <SocialButton
              fullWidth
              variant="outlined"
              startIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0078D4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 12.5V21.5H5.5C4.4 21.5 3.5 20.6 3.5 19.5V5.5C3.5 4.4 4.4 3.5 5.5 3.5H19.5C20.6 3.5 21.5 4.4 21.5 5.5V12.5H11.5Z" />
                </svg>
              }
              onClick={handleOutlookSignup}
            >
              Continue with Outlook
            </SocialButton>
          </Box>
        </FormContainer>
      </Box>
    </StyledContainer>
  );
};

export default SignupPage; 