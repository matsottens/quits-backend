import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Avatar, Button } from '@mui/material';
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '32rem',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
}));

const AccountButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  justifyContent: 'flex-start',
  textTransform: 'none',
  backgroundColor: '#f3f4f6',
  '&:hover': {
    backgroundColor: '#e5e7eb',
  },
}));

const GoogleAccountSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleAccountSelect = () => {
    // Handle account selection
    navigate('/onboarding');
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
          <Typography
            variant="h5"
            sx={{
              color: '#1a365d',
              fontWeight: 600,
              fontFamily: 'Playfair Display, serif',
              mb: 3,
              textAlign: 'center',
            }}
          >
            Choose an account
          </Typography>

          <Box sx={{ mb: 3 }}>
            <AccountButton onClick={handleAccountSelect}>
              <Avatar
                src="https://via.placeholder.com/40"
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 500 }}>John Doe</Typography>
                <Typography variant="body2" color="text.secondary">
                  john.doe@gmail.com
                </Typography>
              </Box>
            </AccountButton>

            <AccountButton onClick={handleAccountSelect}>
              <Avatar
                src="https://via.placeholder.com/40"
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 500 }}>Jane Smith</Typography>
                <Typography variant="body2" color="text.secondary">
                  jane.smith@gmail.com
                </Typography>
              </Box>
            </AccountButton>
          </Box>

          <Button
            variant="outlined"
            fullWidth
            sx={{ textTransform: 'none' }}
            onClick={() => navigate('/login')}
          >
            Use another account
          </Button>
        </StyledPaper>
      </Box>
    </StyledContainer>
  );
};

export default GoogleAccountSelector; 