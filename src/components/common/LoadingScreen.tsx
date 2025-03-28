import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

const StyledContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#ffefd5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
});

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

const LoadingScreen: React.FC = () => {
  return (
    <StyledContainer>
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
      <CircularProgress size={40} />
    </StyledContainer>
  );
};

export default LoadingScreen; 