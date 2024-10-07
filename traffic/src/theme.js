const tokensDark = {
  primary: {
    500: "#1976d2",
    400: "#42a5f5",
  },
  secondary: {
    300: "#ff5722", // Updated to orange
    200: "#ffab91", // Updated to a lighter shade of orange
  },
  grey: {
    900: "#212121",
    800: "#424242",
  },
};

const tokensLight = {
  primary: {
    500: "#1976d2",
    600: "#1565c0",
  },
  secondary: {
    400: "#ff5722", // Updated to orange
    300: "#ffab91", // Updated to a lighter shade of orange
  },
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
  },
};


export const themeSettings = (mode) => {
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              ...tokensDark.primary,
              main: tokensDark.primary[500],
              light: tokensDark.primary[400],
            },
            secondary: {
              ...tokensDark.secondary,
              main: tokensDark.secondary[300],
            },
            neutral: {
              ...tokensDark.grey,
              main: tokensDark.grey[500],
            },
            background: {
              default: tokensDark.grey[900],
              alt: tokensDark.grey[800],
            },
          }
        : {
            primary: {
              ...tokensLight.primary,
              main: tokensLight.primary[500],
              light: tokensLight.primary[600],
            },
            secondary: {
              ...tokensLight.secondary,
              main: tokensLight.secondary[400],
              light: tokensLight.secondary[300],
            },
            neutral: {
              ...tokensLight.grey,
              main: tokensLight.grey[700],
            },
            background: {
              default: tokensLight.grey[50],
              alt: tokensLight.grey[100],
            },
          }),
    },
    typography: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};
