import {
  Box,
  Grid,
  Typography,
  Link,
  Container,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import React, { useContext } from "react";
import { useMutation } from "@apollo/client";
import Footer from "../../components/Footer/Footer";
import { Header, LoginHeader } from "../../components/Header";
import UserContext from "../../context/User";
import useStyle from "./styles";
import { useState } from "react";
import { createContactus } from "../../apollo/server";
import { useTranslation } from "react-i18next";

function ContactUs() {
  const classes = useStyle();
  const { t } = useTranslation();
  const { isLoggedIn } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
  });

  const { name, email, message } = values;

  const [mutate, { loading, error }] = useMutation(createContactus, {
    onCompleted: (res) => {
      console.log({ res });
      setErrorMessage(null);
      setSuccessMessage(t(res.createContactus.message));
      setValues({ name: "", email: "", message: "" });
    },
    onError: (err) => {
      console.log({ err });
      setErrorMessage("Something went wrong!");
    },
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      errors.name = "Name is required";
      setErrorMessage("Name is required");
      return false;
    }

    if (!email) {
      errors.email = "Email is required";
      setErrorMessage("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Email is invalid";
      setErrorMessage("Email is invalid");
      return false;
    }

    if (!message) {
      errors.message = "Message is required";
      setErrorMessage("Message is required");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      mutate({
        variables: {
          name,
          email,
          message,
        },
      });
    }
  };

  return (
    <Grid className={classes.root}>
      {isLoggedIn ? <Header /> : <LoginHeader showIcon />}
      <Grid container className={classes.mainContainer}>
        <Grid item xs={12} md={12} lg={12} className={classes.imageContainer}>
          <Typography
            variant="h4"
            color="textPrimary"
            align="center"
            className={classes.title}
          >
            Contact Us
          </Typography>
        </Grid>
        <Grid item xs={12} md={12} lg={12} pt={5}>
          <Container maxWidth="md">
            <Section title="Get in Touch">
              <Typography variant="body1" gutterBottom>
                We'd love to hear from you! Reach out via the form below, or
                contact us directly through the details provided.
              </Typography>
            </Section>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Section title="Contact Information">
                  <Typography>
                    Email:{" "}
                    <Link href="mailto:support@orderat.ai">
                      support@orderat.ai
                    </Link>
                  </Typography>
                  <Typography>Phone: +20 123 456 7890</Typography>
                  <Typography>
                    Address: 123 Orderat Street, Cairo, Egypt
                  </Typography>
                </Section>
                <Section title="Follow Us">
                  <Link
                    href="https://facebook.com/orderat"
                    target="_blank"
                    rel="noopener"
                  >
                    Facebook
                  </Link>
                  <br />
                  <Link
                    href="https://twitter.com/orderat"
                    target="_blank"
                    rel="noopener"
                  >
                    Twitter
                  </Link>
                  <br />
                  <Link
                    href="https://instagram.com/orderat"
                    target="_blank"
                    rel="noopener"
                  >
                    Instagram
                  </Link>
                </Section>
              </Grid>

              <Grid item xs={12} md={6}>
                <Section title="Send a Message">
                  {errorMessage && (
                    <Alert variant="filled" severity="error">
                      {errorMessage}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert variant="filled" severity="success">
                      {successMessage}
                    </Alert>
                  )}
                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      label="Name"
                      margin="normal"
                      variant="outlined"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: "#000",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      margin="normal"
                      variant="outlined"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: "#000",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      margin="normal"
                      variant="outlined"
                      name="message"
                      value={message}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: "#000",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading}
                      sx={{
                        mt: 2,
                        backgroundColor: loading ? "grey" : undefined,
                      }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Section>
              </Grid>
            </Grid>
          </Container>
        </Grid>
      </Grid>
      <Box className={classes.footerContainer}>
        <Box className={classes.footerWrapper}>
          <Footer />
        </Box>
      </Box>
    </Grid>
  );
}

const Section = ({ title, children }) => (
  <Box mb={4}>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

export default React.memo(ContactUs);
