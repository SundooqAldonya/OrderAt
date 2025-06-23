import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import LoginEmailIcon from "../../assets/images/emailLock.png";
import FlashMessage from "../../components/FlashMessage";
import useRegistration from "../../hooks/useRegistration";
import { isValidEmailAddress } from "../../utils/customFunction";
import { LoginWrapper } from "../Wrapper";
import useStyles from "./styles";
import { Avatar } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { customerLogin } from "../../apollo/server";
import UserContext from "../../context/User";

function LoginEmail() {
  const { t } = useTranslation();
  const formRef = useRef();
  const theme = useTheme();
  const classes = useStyles();
  const { state } = useLocation();
  const [mainError, setMainError] = useState({});
  const [passError, setPassError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const location = useLocation();
  const { phone, from } = location.state || {};
  const { setTokenAsync } = useContext(UserContext);

  const { setLogin } = useRegistration();

  const [mutateCustomerLogin, { loading }] = useMutation(customerLogin, {
    onCompleted: async (res) => {
      console.log({ res });
      setLogin(true);
      await setTokenAsync(res.customerLogin.token);
    },
    onError: (err) => {
      console.log({ err });
      const message = err.message.split(" ")[1];
      setMainError({
        type: "error",
        message: t(message),
      });
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // useEffect(() => {
  //   if (loginError) {
  //     setMainError({
  //       type: "error",
  //       message: loginError,
  //     });
  //   }
  // }, [loginError]);

  // const clearErrors = () => {
  //   setEmailError("");
  //   setPassError("");
  //   setLoginError("");
  // };

  // const handleAction = () => {
  //   clearErrors();
  //   let validate = true;
  //   const emailValue = formRef.current["userEmail"].value;
  //   const passValue = formRef.current["userPass"].value;
  //   // if (!isValidEmailAddress(emailValue)) {
  //   //   setEmailError("Invalid Email");
  //   //   validate = false;
  //   //   return;
  //   // }
  //   if (!passValue) {
  //     setPassError("Password required");
  //     validate = false;
  //     return;
  //   }
  //   if (validate) {
  //     setLoading(true);
  //     const user = {
  //       email: emailValue,
  //       password: passValue,
  //       type: "default",
  //     };
  //     mutateLogin(user);
  //   } else {
  //     setLoginError("Something is missing");
  //   }
  // };

  const toggleSnackbar = useCallback(() => {
    setMainError({});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutateCustomerLogin({
      variables: {
        phone,
        password,
      },
    });
  };

  return (
    <LoginWrapper>
      <FlashMessage
        open={Boolean(mainError.type)}
        severity={mainError.type}
        alertMessage={mainError.message}
        handleClose={toggleSnackbar}
      />
      <form onSubmit={handleSubmit}>
        <Box display="flex">
          <Box m="auto">
            <Avatar
              m="auto"
              alt="email"
              src={LoginEmailIcon}
              sx={{
                width: 100,
                height: 100,
                display: "flex",
                alignSelf: "center",
              }}
            />
          </Box>
        </Box>
        <Box mt={theme.spacing(2)} />
        <Typography variant="h5" className={classes.font700}>
          {t("login_using_phone")}
        </Typography>
        <Typography
          variant="caption"
          className={`${classes.grayText} ${classes.caption}`}
        >
          {t("type_your_password")}
        </Typography>
        <Box mt={theme.spacing(2)} />
        <TextField
          name={"phone"}
          // defaultValue={state?.email ?? "demo-customer@enatega.com"}
          error={Boolean(emailError)}
          helperText={emailError}
          fullWidth
          value={phone}
          disabled
          variant="outlined"
          label="Phone"
          InputLabelProps={{
            style: {
              color: theme.palette.grey[600],
            },
          }}
        />
        <Box mt={theme.spacing(2)} />
        <TextField
          name={"password"}
          value={password}
          InputLabelProps={{
            style: {
              color: theme.palette.grey[600],
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showPassword ? (
                    <Visibility color="primary" />
                  ) : (
                    <VisibilityOff color="primary" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={Boolean(passError)}
          helperText={passError}
          fullWidth
          variant="outlined"
          label="Password"
          type={showPassword ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
        />
        <RouterLink
          to="/forgot-password"
          state={{ email: state?.email }}
          style={{ textDecoration: "none", display: "flex" }}
        >
          <Button>
            <Typography
              variant="caption"
              style={{
                textTransform: "none",
                display: "flex",
                marginBottom: theme.spacing(3),
              }}
              className={classes.font700}
            >
              {t("forgot_password")}
            </Typography>
          </Button>
        </RouterLink>
        <Box mt={theme.spacing(2)} />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          disableElevation
          disabled={loading}
          className={`${classes.btnBase} ${classes.customBtn}`}
          // onClick={(e) => {
          //   e.preventDefault();
          //   handleAction();
          // }}
        >
          {loading ? (
            <CircularProgress color="primary" />
          ) : (
            <Typography
              variant="caption"
              className={`${classes.caption} ${classes.font700}`}
            >
              {t("continue")}
            </Typography>
          )}
        </Button>
        <Box mt={theme.spacing(2)} />
      </form>
    </LoginWrapper>
  );
}

export default LoginEmail;
