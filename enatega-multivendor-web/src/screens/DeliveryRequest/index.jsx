import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, gql } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import RoomIcon from "@mui/icons-material/Room";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { Header, LoginHeader } from "../../components/Header";
import UserContext from "../../context/User";
import { useNavigate } from "react-router-dom";
import { useRequestDelivery } from "../../context/requestDelivery";
import { getDeliveryCalculation } from "../../apollo/server";

const CREATE_DELIVERY_REQUEST = gql`
  mutation CreateDeliveryRequest($input: CreateDeliveryRequestInput!) {
    createDeliveryRequest(input: $input) {
      message
    }
  }
`;

const DeliveryRequest = () => {
  const navigate = useNavigate();
  const { state } = useRequestDelivery();

  const [pickupCoords, setPickupCoords] = useState({
    lat: 30.033,
    lng: 31.233,
  });
  const [dropoffCoords, setDropoffCoords] = useState({
    lat: 30.05,
    lng: 31.24,
  });
  const [notes, setNotes] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const { isLoggedIn } = useContext(UserContext);

  console.log({ state });
  const addressTo = localStorage.getItem("addressTo");
  console.log({ addressTo: JSON.parse(addressTo) });
  const addressFrom = localStorage.getItem("addressFrom");
  console.log({ addressFrom: JSON.parse(addressFrom) });

  const mapRef = useRef();

  const { data, loading, refetch } = useQuery(getDeliveryCalculation, {
    variables: {
      input: {
        code: coupon?.code || "",
        originLat: pickupCoords.lat,
        originLong: pickupCoords.lng,
        destLat: dropoffCoords.lat,
        destLong: dropoffCoords.lng,
      },
    },
    skip: !pickupCoords || !dropoffCoords,
  });

  const [createDelivery, { loading: submitting }] = useMutation(
    CREATE_DELIVERY_REQUEST,
    {
      onCompleted: (res) => {
        alert(res.createDeliveryRequest.message);
      },
      onError: (err) => {
        console.error(err);
        alert("Failed to submit delivery");
      },
    }
  );

  useEffect(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: pickupCoords,
        zoom: 13,
      });
      new window.google.maps.Marker({
        position: pickupCoords,
        map,
        title: "Pickup",
      });
      new window.google.maps.Marker({
        position: dropoffCoords,
        map,
        title: "Dropoff",
      });
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropoffCoords);
      map.fitBounds(bounds);
    }
  }, [pickupCoords, dropoffCoords]);

  const handleSubmit = () => {
    if (!notes) {
      alert("Notes are required.");
      return;
    }

    createDelivery({
      variables: {
        input: {
          pickupLat: pickupCoords.lat,
          pickupLng: pickupCoords.lng,
          pickupAddressText: "Pickup Address",
          pickupAddressFreeText: "",
          dropoffLat: dropoffCoords.lat,
          dropoffLng: dropoffCoords.lng,
          dropoffAddressText: "Dropoff Address",
          dropoffAddressFreeText: "",
          deliveryFee: data?.getDeliveryCalculation?.amount || 0,
          requestChannel: "customer_web",
          is_urgent: isUrgent,
          notes,
        },
      },
    });
  };

  return (
    <Box>
      {isLoggedIn ? <Header /> : <LoginHeader showIcon />}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          mt={5}
          sx={{ textAlign: "center" }}
        >
          Otlob Mandoob
        </Typography>

        <Box
          ref={mapRef}
          sx={{
            width: "100%",
            height: 300,
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
          }}
        />

        <Box mb={2}>
          <Typography variant="subtitle1">Pickup Location</Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate("/otlob-mandoob/pickup")}
          >
            Edit
          </Button>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1">Dropoff Location</Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate("/otlob-mandoob/dropoff")}
          >
            Edit
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Item Description"
          placeholder="What are you sending?"
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />

        {!coupon ? (
          <Button
            variant="outlined"
            startIcon={<ConfirmationNumberIcon />}
            onClick={() => setOpenVoucherModal(true)}
          >
            Apply Voucher
          </Button>
        ) : (
          <Box mb={2}>
            <Typography variant="body1">
              Applied Coupon: <strong>{coupon.code}</strong> ({coupon.discount}
              %)
            </Typography>
            <Button onClick={() => setCoupon(null)}>Remove</Button>
          </Box>
        )}

        <Box mb={2}>
          {loading ? (
            <Typography>Calculating delivery fee...</Typography>
          ) : (
            <Typography variant="h6">
              Delivery Fee: {data?.getDeliveryCalculation?.amount ?? "--"} EGP{" "}
              {coupon && (
                <Typography
                  component="span"
                  sx={{ textDecoration: "line-through", color: "gray", ml: 1 }}
                >
                  {data?.getDeliveryCalculation?.originalDiscount} EGP
                </Typography>
              )}
            </Typography>
          )}
        </Box>

        <LoadingButton
          variant="contained"
          fullWidth
          loading={submitting}
          onClick={handleSubmit}
        >
          Submit Delivery Request
        </LoadingButton>

        {/* Coupon Modal */}
        <Dialog
          open={openVoucherModal}
          onClose={() => setOpenVoucherModal(false)}
          fullWidth
        >
          <DialogTitle>Apply Voucher</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Voucher Code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setVoucherCode("")}>
                      ✖
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenVoucherModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setCoupon({ code: voucherCode, discount: 10 }); // Fake coupon logic for demo
                setVoucherCode("");
                setOpenVoucherModal(false);
                refetch();
              }}
              disabled={!voucherCode}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
export default DeliveryRequest;
