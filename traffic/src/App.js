import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import Layout from "scenes/layout";
import Dashboard from "scenes/dashboard";
import Calendrier from "scenes/calendrier";
import Roaming from "scenes/roaming";
import Mapping from "scenes/mapping"
import Overview from "scenes/overview";
import Dashboard2 from "scenes/dashboard2";
import Linechart from "components/Linechart";
import Settings from "scenes/settings"; 
import Authentification from "scenes/authentification"
import Register from "scenes/register";
import ForgotPasswordComponent from "components/ForgotPasswordComponent";
function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  
  return (
    
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
          <Route path="/" element={<Navigate to="/Authentification" replace />} />
          <Route path="/Authentification" element={<Authentification/>} />
          <Route path="/Register" element={< Register/>} />
          <Route path="/ForgotPassword" element={< ForgotPasswordComponent/>} /> ForgotPasswordComponent
            <Route element={<Layout />}>
             
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/Statisqtique" element={<Roaming />} />
              <Route path="/calendrier" element={<Calendrier />} />
              <Route path="/mapping" element={<Mapping />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/Dashboard2" element={<Dashboard2/>} />
              
              
             
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
