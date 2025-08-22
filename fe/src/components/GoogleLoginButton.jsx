import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { Google } from "@mui/icons-material";

const GoogleLoginButton = ({ onSuccess, onError, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        onError("Không thể tải Google API");
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setIsGoogleLoaded(true);
        } catch {
          onError("Không thể khởi tạo Google API");
        }
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      if (response.credential) {
        await onSuccess(response.credential);
      } else {
        throw new Error("Không nhận được credential từ Google");
      }
    } catch (error) {
      onError(error.message || "Lỗi đăng nhập Google");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isGoogleLoaded) {
      onError("Google API chưa sẵn sàng");
      return;
    }

    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      onError("Google Client ID chưa được cấu hình");
      return;
    }

    setLoading(true);
    renderGoogleButton();
  };

  const renderGoogleButton = () => {
    try {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.top = "-9999px";
      tempContainer.style.left = "-9999px";
      document.body.appendChild(tempContainer);

      window.google.accounts.id.renderButton(tempContainer, {
        theme: "outline",
        size: "large",
        type: "standard",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 250,
      });

      setTimeout(() => {
        const googleButton = tempContainer.querySelector('div[role="button"]');
        if (googleButton) {
          googleButton.click();
        }
        document.body.removeChild(tempContainer);
        setLoading(false);
      }, 100);
    } catch {
      setLoading(false);
      onError("Không thể hiển thị nút đăng nhập Google");
    }
  };

  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={handleClick}
      disabled={disabled || loading || !isGoogleLoaded}
      startIcon={loading ? <CircularProgress size={20} /> : <Google />}
      sx={{
        borderColor: "#4285f4",
        color: "#4285f4",
        "&:hover": {
          borderColor: "#3367d6",
          backgroundColor: "rgba(66, 133, 244, 0.04)",
        },
        "&:disabled": {
          borderColor: "#ccc",
          color: "#ccc",
        },
        textTransform: "none",
        fontWeight: 500,
        py: 1.5,
      }}
    >
      {loading
        ? "Đang đăng nhập..."
        : !isGoogleLoaded
          ? "Đang tải Google API..."
          : "Đăng nhập với Google"}
    </Button>
  );
};

export default GoogleLoginButton;
