import { gql, useMutation } from "@apollo/client";
import { Avatar } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useCallback, useContext, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { emailExist, phoneExist } from "../../apollo/server";
import EmailImage from "../../assets/images/email.png";
import FlashMessage from "../../components/FlashMessage";
import { LoginWrapper } from "../Wrapper";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import UserContext from "../../context/User";

function isValidEmailAddress(address) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(address);
}

const EMAIL = gql`
  ${emailExist}
`;

const PHONE_EXISTS = gql`
  ${phoneExist}
`;

function NewLogin() {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, setPhone } = useContext(UserContext);

  // const [EmailEixst, { loading }] = useMutation(EMAIL, {
  //   onCompleted,
  //   onError,
  // });

  const [mutatePhoneExists, { loading }] = useMutation(PHONE_EXISTS, {
    onCompleted: (res) => {
      console.log({ res });
      navigate("/login-email", {
        replace: true,
        state: {
          phone,
          from: location.state?.from,
        },
      });
    },
    onError: (err) => {
      console.log({ err });
      navigate("/registration", {
        replace: true,
        state: {
          phone,
          from: location.state?.from,
        },
      });
    },
  });

  function onCompleted({ emailExist }) {
    if (emailExist?._id !== null) {
      navigate("/login-email", {
        replace: true,
        state: {
          email: formRef.current["email"].value,
          from: location.state?.from,
        },
      });
    } else {
      navigate("/registration", {
        replace: true,
        state: {
          email: formRef.current["email"].value,
          from: location.state?.from,
        },
      });
    }
  }

  // const handleAction = () => {
  //   const emailValue = formRef.current["email"].value;
  //   EmailEixst({ variables: { email: emailValue } });
  //   // if (isValidEmailAddress(emailValue)) {
  //   //   setError("");
  //   //   EmailEixst({ variables: { email: emailValue } });
  //   // } else {
  //   //   setError("Invalid Email");
  //   // }
  // };

  const toggleSnackbar = useCallback(() => {
    setError("");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutatePhoneExists({
      variables: {
        phone,
      },
    });
  };

  return (
    <LoginWrapper>
      <FlashMessage
        open={Boolean(error)}
        severity={"error"}
        alertMessage={error}
        handleClose={toggleSnackbar}
      />
      <Box display="flex">
        <Box m="auto">
          <Avatar
            m="auto"
            alt="email"
            src={EmailImage}
            sx={{
              width: 100,
              height: 100,
              display: "flex",
              alignSelf: "center",
            }}
          />
        </Box>
      </Box>
      <Box mt={theme.spacing(1)} />
      <Typography variant="h5" className={classes.font700}>
        {t("whatsYourPhone")}
      </Typography>
      <Box mt={theme.spacing(1)} />
      <Typography
        variant="caption"
        className={`${classes.caption} ${classes.fontGrey}`}
      >
        {t("checkAccount")}
      </Typography>
      <Box mt={theme.spacing(4)} />
      <form onSubmit={handleSubmit}>
        <TextField
          name={"phone"}
          error={Boolean(error)}
          helperText={error}
          variant="outlined"
          defaultValue={""}
          label="Phone"
          type={"text"}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          InputLabelProps={{
            style: {
              color: theme.palette.grey[600],
            },
          }}
        />
        <Box mt={theme.spacing(8)} />
        <Button
          variant="contained"
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
      </form>
    </LoginWrapper>
  );
}

export default NewLogin;
