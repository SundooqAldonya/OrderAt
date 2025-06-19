/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Grid, Typography, Link, Container } from "@mui/material";
import React, { useContext, useEffect } from "react";

import Footer from "../../components/Footer/Footer";
import { Header, LoginHeader } from "../../components/Header";
import UserContext from "../../context/User";
import useStyle from "./styles";

function PrivacyPolicy() {
  const classes = useStyle();
  const { isLoggedIn } = useContext(UserContext);

  const Section = ({ title, children }) => (
    <Box mb={4}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Grid className={classes.root}>
      {isLoggedIn ? <Header /> : <LoginHeader showIcon />}
      <Grid container className={classes.mainContainer}>
        <Grid item sm={12} md={12} className={classes.imageContainer}>
          <Typography
            variant="h4"
            color="textPrimary"
            align="center"
            className={classes.title}
          >
            Privacy Policy
          </Typography>
        </Grid>
        <Grid item sm={12} md={12}>
          <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Privacy Policy
            </Typography>

            <Typography mb={4}>
              Orderat, operated under{" "}
              <Link href="https://orderat.ai" target="_blank" rel="noopener">
                https://orderat.ai
              </Link>{" "}
              ,{" "}
              <Link href="https://orderatco.com" target="_blank" rel="noopener">
                https://orderatco.com
              </Link>{" "}
              ("Orderat", "we", "us", or "our"), is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, store,
              and protect your personal data when you use our services,
              including but not limited to our mobile applications (Orderat,
              Orderat Business, Orderat Drive) and websites (https://orderat.ai,
              https://orderatco.com admin portal, and web dashboards).
            </Typography>

            <Section title="1. Information We Collect">
              <Typography fontWeight="bold">
                1.1 Information You Provide to Us
              </Typography>
              <ul>
                <li>
                  Full name, email address, phone number, delivery address
                </li>
                <li>Business details (if you’re a merchant)</li>
                <li>Payment and transaction information</li>
                <li>Feedback, messages, and reviews</li>
                <li>Account credentials (for login and authentication)</li>
              </ul>

              <Typography fontWeight="bold" mt={2}>
                1.2 Information We Collect Automatically
              </Typography>
              <ul>
                <li>Device information: type, operating system, identifiers</li>
                <li>App usage data, crash logs, and performance metrics</li>
                <li>IP address, browser type, and access timestamps</li>
                <li>Geolocation data (Orderat Drive and with user consent)</li>
              </ul>

              <Typography fontWeight="bold" mt={2}>
                1.3 Cookies and Tracking Technologies
              </Typography>
              <ul>
                <li>Improve functionality and user experience</li>
                <li>Analyze usage patterns</li>
                <li>Serve personalized content and ads (where applicable)</li>
              </ul>
              <Typography>
                You can manage cookie preferences via your browser settings.
                Learn more at:{" "}
                <Link
                  href="https://www.allaboutcookies.org"
                  target="_blank"
                  rel="noopener"
                >
                  www.allaboutcookies.org
                </Link>
              </Typography>
            </Section>

            <Section title="2. How We Use Your Information">
              <ul>
                <li>Provide, manage, and improve our services</li>
                <li>Process orders and payments</li>
                <li>
                  Facilitate communication between customers, businesses, and
                  riders
                </li>
                <li>Verify identity and prevent fraud</li>
                <li>Provide customer support</li>
                <li>
                  Send transactional and promotional communications (you may opt
                  out anytime)
                </li>
                <li>Comply with legal obligations</li>
              </ul>
            </Section>

            <Section title="3. Sharing Your Information">
              <ul>
                <li>
                  Service providers (e.g., payment processors, cloud platforms,
                  analytics providers)
                </li>
                <li>Delivery partners or businesses (to fulfill orders)</li>
                <li>Authorities or law enforcement (when legally required)</li>
                <li>
                  Third-party marketing partners (only with your explicit
                  consent)
                </li>
              </ul>
              <Typography>We do not sell your personal data.</Typography>
            </Section>

            <Section title="4. Data Retention and Security">
              <Typography>
                We retain your data only for as long as necessary for business
                and legal purposes. We implement appropriate technical and
                organizational measures to protect your data against
                unauthorized access, loss, or misuse.
              </Typography>
            </Section>

            <Section title="5. Your Rights and Choices">
              <Typography>
                Depending on your location, you may have the following rights:
              </Typography>
              <ul>
                <li>Access to the personal data we hold about you</li>
                <li>Correction of inaccurate or incomplete data</li>
                <li>Deletion of your data ("Right to be forgotten")</li>
                <li>Restriction or objection to processing</li>
                <li>Data portability</li>
              </ul>
              <Typography>
                To exercise any of these rights, contact us at:{" "}
                <Link href="mailto:info@orderat.ai">info@orderat.ai</Link>
              </Typography>
            </Section>

            <Section title="6. Children's Privacy">
              <Typography>
                Our services are not intended for children under the age of 13
                (or the minimum age required in your jurisdiction). We do not
                knowingly collect data from children.
              </Typography>
            </Section>

            <Section title="7. International Data Transfers">
              <Typography>
                If you are located outside of Egypt or Australia, your data may
                be transferred to, stored, and processed in countries where we
                or our service providers operate. We ensure appropriate
                safeguards are in place when required by law.
              </Typography>
            </Section>

            <Section title="8. Third-Party Links">
              <Typography>
                Our platforms may link to third-party websites or services. We
                are not responsible for their privacy practices. Please review
                their privacy policies independently.
              </Typography>
            </Section>

            <Section title="9. Updates to This Policy">
              <Typography>
                We may update this Privacy Policy to reflect changes in our
                practices, legal requirements, or service offerings. We
                encourage you to review this page regularly. Continued use of
                our services constitutes acceptance of the updated policy.
              </Typography>
            </Section>

            <Section title="10. Contact Us">
              <Typography>
                For questions or concerns regarding this policy or your personal
                data, contact:
              </Typography>
              <ul>
                <li>
                  📧{" "}
                  <Link href="mailto:info@orderatco.com">
                    info@orderatco.com
                  </Link>
                </li>
                <li>
                  🌐{" "}
                  <Link
                    href="https://orderat.ai"
                    target="_blank"
                    rel="noopener"
                  >
                    orderat.ai
                  </Link>{" "}
                  ,{" "}
                  <Link
                    href="https://orderatco.com"
                    target="_blank"
                    rel="noopener"
                  >
                    orderatco.com
                  </Link>
                </li>
              </ul>
            </Section>
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

export default React.memo(PrivacyPolicy);
