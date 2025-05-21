import React, { useCallback, useContext, useEffect, useState } from "react";
import { GoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ConfigurableValues from "../../config/constants";
import { Link as RouterLink } from "react-router-dom";
import { useLocation, useNavigate } from "react-router";
import GoogleIcon from "../../assets/icons/GoogleIcon";
import FlashMessage from "../../components/FlashMessage";
import useRegistration from "../../hooks/useRegistration";
import { LoginWrapper } from "../Wrapper";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import { LoginSocialGoogle } from "reactjs-social-login";
import { GoogleLoginButton } from "react-social-login-buttons";
import { googleAuth } from "../../apollo/server";
import { useMutation } from "@apollo/client";
import UserContext from "../../context/User";

function Login() {
  const { GOOGLE_CLIENT_ID } = ConfigurableValues();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [mainError, setMainError] = useState({});
  const [profile, setProfile] = useState({});
  const [provider, setProvider] = useState({});
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const classes = useStyles();
  const {
    goolgeSuccess,
    authenticationFailure,
    loading,
    setLoading,
    setLogin,
    loginButton,
    loginButtonSetter,
    loginError,
  } = useRegistration();
  const location = useLocation();
  const { setTokenAsync } = useContext(UserContext);

  const [mutateGoogleLogin] = useMutation(googleAuth, {
    onCompleted: async ({ googleAuth }) => {
      setLogin(true);
      await setTokenAsync(googleAuth.token);
      setMessage(googleAuth.message);
      setType("success");
      setOpen(true);
      navigate("/");
    },
  });

  const showMessage = useCallback((messageObj) => {
    setMainError(messageObj);
  }, []);

  useEffect(() => {
    if (loginError) {
      showMessage({
        type: "error",
        message: loginError,
      });
    }
  }, [loginError, showMessage]); // Added showMessage to the dependency array

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: "email",
      });
    }
    gapi.load("client:auth2", start);
  }, [GOOGLE_CLIENT_ID]);

  const callGoogle = useCallback(
    (clickAction) => {
      if (!loading) {
        loginButtonSetter("GOOGLE");
        setLoading(true);
        clickAction();
      }
    },
    [loading, loginButtonSetter, setLoading] // Added loginButtonSetter and setLoading to the dependency array
  );

  // const toggleSnackbar = useCallback(() => {
  //   setMainError({});
  // }, []);

  const onLoginStart = useCallback(() => {
    console.log("login start");
  }, []);
  console.log({ provider, profile });

  const onLogoutSuccess = useCallback(() => {
    setProfile(null);
    setProvider("");
    alert("logout success");
  }, []);

  const handleGoogleLogin = ({ provider, data }) => {
    console.log({ data, provider });
    mutateGoogleLogin({
      variables: {
        code: data.code,
      },
    });

    // setProvider(provider);
    // setProfile(data);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <LoginWrapper>
      <FlashMessage
        open={open}
        severity={type}
        alertMessage={message}
        handleClose={handleClose}
      />
      <Typography variant="h5" className={classes.font700}>
        {t("welcome")}
      </Typography>

      <Typography
        variant="caption"
        className={`${classes.caption} ${classes.fontSubHead} ${classes.font700} `}
      >
        {t("signUpOrLogin")}
      </Typography>
      {/* <LoginSocialFacebook
        // appId={"3511551789148450"}
        appId={"922954276598263"}
        onLoginStart={onLoginStart}
        onResolve={({ provider, data }) => {
          console.log({ provider, data });
          setProvider(provider);
          setProfile(data);
        }}
        onReject={(err) => {
          console.log(err);
        }}
      >
        <FacebookLoginButton />
      </LoginSocialFacebook> */}
      {/* <LoginSocialGoogle
        client_id={
          "41071470725-ldfj8q61m7k9s9hpcboqmfgpi67skv0e.apps.googleusercontent.com"
        }
        // onLoginStart={onLoginStart}
        // redirect_uri={REDIRECT_URI}
        scope="openid profile email"
        discoveryDocs="claims_supported"
        access_type="offline"
        onResolve={handleGoogleLogin}
        onReject={(err) => {
          console.log(err);
        }}
      >
        <GoogleLoginButton />
      </LoginSocialGoogle> */}
      {/* <GoogleLogin
        clientId={GOOGLE_CLIENT_ID}
        render={(renderProps) => (
          <Button
            variant="contained"
            fullWidth
            disableElevation
            className={`${classes.gButton} ${classes.btnBase}`}
            onClick={() => callGoogle(renderProps.onClick)}
            disabled={renderProps.disabled || loading}
            startIcon={
              renderProps.disabled || loading ? (
                <CircularProgress color="secondary" size={24} />
              ) : (
                <GoogleIcon />
              )
            }
          >
            {loading && loginButton === "GOOGLE" ? null : (
              <Typography
                variant="caption"
                color="textPrimary"
                align="center"
                className={`${classes.font700} ${classes.caption} ${classes.btnText}`}
              >
                {t("signInWithGoogle")}
              </Typography>
            )}
          </Button>
        )}
        onSuccess={goolgeSuccess}
        onFailure={authenticationFailure}
        cookiePolicy={"single_host_origin"}
      /> */}

      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "80%",
            display: "flex",
            alignSelf: "center",
            justifyContent: "space-around",
            alignItems: "center",
            margin: theme.spacing(2, 0),
          }}
        >
          <div className={classes.line}></div>
          <Typography
            variant="caption"
            className={`${classes.fontGrey} ${classes.caption} ${classes.font700} `}
          >
            {t("or")}
          </Typography>
          <div className={classes.line}></div>
        </div>
      </Box> */}
      <RouterLink
        to="/new-login"
        state={{ from: location.state?.from }}
        style={{ textDecoration: "none" }}
      >
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disableElevation
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`${classes.btnBase} ${classes.customBtn}`}
        >
          <Typography
            variant="caption"
            color="secondary"
            className={`${classes.font700} ${classes.caption}`}
          >
            {t("continueWithPhone")}
          </Typography>
        </Button>
      </RouterLink>

      <Box
        display="flex"
        sx={{ justifyContent: "center", alignItems: "center" }}
        flexWrap="wrap"
        mt={theme.spacing(3)}
      >
        <Typography
          style={{
            width: "80%",
          }}
          variant="caption"
          className={`${classes.fontGrey} ${classes.caption} `}
        >
          {t("bySigningUp")}
          <RouterLink to="/terms" style={{ textDecoration: "none" }}>
            <Typography
              variant="caption"
              color="primary"
              className={`${classes.font700} ${classes.caption}`}
            >
              {t("terms")}
            </Typography>
          </RouterLink>
          {t("and")}
          <RouterLink to="/privacy" style={{ textDecoration: "none" }}>
            <Typography
              variant="caption"
              color="primary"
              className={`${classes.font700} ${classes.caption}`}
            >
              {t("privacyPolicy")}
            </Typography>
          </RouterLink>
        </Typography>
      </Box>
    </LoginWrapper>
  );
}

export default Login;
