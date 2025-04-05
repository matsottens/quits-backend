import * as React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }: any) => ({
  minHeight: '100vh',
  backgroundColor: '#ffefd5',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
}));

const Calendar: React.FC = () => {
  return (
    <StyledContainer>
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1a365d',
            fontWeight: 600,
            fontFamily: 'Playfair Display, serif',
            mb: 2,
          }}
        >
          Calendar
        </Typography>
        {/* Add calendar functionality here */}
      </Box>
    </StyledContainer>
  );
};

export default Calendar; 