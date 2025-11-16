import React, { Fragment, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ZonePricingForm from ".";
import { Paper } from "@mui/material";
import CityForm from "./CityForm";
import AreaForm from "./AreaForm";
import DeliveryZoneForm from "./DeliveryZoneForm";
import DriverPayoutForm from "./DriverPayoutForm";

const steps = [
  "City",
  "Area",
  "Delivery Zone",
  "Zone Pricing",
  "Driver Payout",
];

function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {/* <Step>
          <StepLabel>City</StepLabel>
        </Step>
        <Step>
          <StepLabel>Area</StepLabel>
        </Step> */}
        {/* <Step>
          <StepLabel>Delivery Zone</StepLabel>
        </Step> */}
        <Step>
          <StepLabel>Zone Pricing</StepLabel>
        </Step>
        <Step>
          <StepLabel>Driver Payout</StepLabel>
        </Step>
      </Stepper>
      <Box sx={{ mt: 3 }}>
        {/* {activeStep === 0 && <CityForm onNext={() => setActiveStep(1)} />}
        {activeStep === 1 && <AreaForm onNext={() => setActiveStep(2)} />}
        {activeStep === 2 && (
          <DeliveryZoneForm onNext={() => setActiveStep(3)} />
        )} */}
        {activeStep === 0 && (
          <ZonePricingForm onNext={() => setActiveStep(1)} />
        )}
        {activeStep === 1 && (
          <DriverPayoutForm onNext={() => setActiveStep(2)} />
        )}
      </Box>
      {activeStep === steps.length ? (
        <Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </Fragment>
      ) : (
        <Fragment>
          {/* <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography> */}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {/* {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )} */}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </Fragment>
      )}
    </Box>
  );
}
export default HorizontalLinearStepper;
