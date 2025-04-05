import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

const StyledContainer = styled(Container)(({ theme }: any) => ({
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

const StyledPaper = styled(Paper)(({ theme }: any) => ({
  padding: theme.spacing(4),
  maxWidth: '32rem',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
}));

const StyledButton = styled(Button)(({ theme }: any) => ({
  height: '3.5rem',
  backgroundColor: 'black',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <StyledContainer>
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

        <StyledPaper>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#1a365d',
                fontWeight: 700,
                fontFamily: 'Playfair Display, serif',
                mb: 2,
              }}
            >
              Welcome to Quits
            </Typography>
            <Typography
              sx={{
                color: '#4b5563',
                mb: 4,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Your personal subscription tracker. Keep track of all your subscriptions, monitor price changes, and never miss a discount period again.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <StyledButton onClick={handleGetStarted} fullWidth>
              Get Started
            </StyledButton>
          </Box>
        </StyledPaper>
      </Box>
    </StyledContainer>
  );
};

export default OnboardingPage; 