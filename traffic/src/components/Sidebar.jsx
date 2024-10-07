import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  PointOfSaleOutlined,
  TrendingUpOutlined,
  PublicOutlined,
  CalendarMonthOutlined,
  BarChartOutlined,
} from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import FlexBetween from "./FlexBetween";

// Navigation items with specific destinations
const navItems = [
  {
    text: "Accueil",
    icon: <HomeOutlined />,
    destination: "dashboard", // Navigate to "/dashboard"
  },
  {
    text: " Trafic international",
    icon: null,
  },
  {
    text: "Tableau de bord",
    icon: <BarChartOutlined />,
    destination: "overview",
  },
  {
    text: "Mappage",
    icon: <PublicOutlined />,
    destination: "mapping",
  },
  {
    text: "Calendrier",
    icon: <CalendarMonthOutlined />,
    destination: "calendrier",
  },
  {
    text: "Analyse Financière",
    icon: null,
  },
  {
    text: "Statisqtique",
    icon: <TrendingUpOutlined />,
    destination: "statisqtique",
  },
  {
    text: "Management",
    icon: null,
  },
  {
    text: "Settings",
    icon: <SettingsIcon />,
    destination: "settings",
  },
];

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Get the current route without leading '/'
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Typography variant="h4" fontWeight="bold">
                    Orange
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <List>
              {navItems.map(({ text, icon, destination }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
                      {text}
                    </Typography>
                  );
                }

                // Set destination based on the navItems array or default to lowercase text
                const route = destination || text.toLowerCase();

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${route}`);
                        setActive(route);
                      }}
                      sx={{
                        backgroundColor:
                          active === route
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === route
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === route
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === route && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Box position="absolute" bottom="2rem">
            <Divider />
            <FlexBetween textTransform="none" gap="1rem" m="1.5rem 2rem 0 3rem">
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.9rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user.name}
                </Typography>
                <Typography
                  fontSize="0.8rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user.occupation}
                </Typography>
              </Box>
            </FlexBetween>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
