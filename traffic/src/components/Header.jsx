import { Typography, Box, useTheme } from "@mui/material";
import React from "react";
import Favicon from "../assets/favicon.ico.png"; // Assurez-vous que le chemin soit correct

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box display="flex" alignItems="center" mb="20px">
      <img src={Favicon} alt="logo" style={{ width: '50px', marginRight: '10px' }} />
      <Box>
        <Typography
          variant="h2"
          color={theme.palette.secondary[100]}
          fontWeight="bold"
          sx={{ mb: "5px" }}
        >
          {title}
        </Typography>
        <Typography variant="h5" color={theme.palette.secondary[300]}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
