import { Box, TextField, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export const SearchHeader = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 700) {
        setIsSearchVisible(false);
      } else {
        setIsSearchVisible(true);
      }
    };

    // Add the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onChangeModal = () => {
    setOpen((op) => !op);
  };

  if (isSearchVisible) return <></>;

  return (
    <div onClick={onChangeModal}>
      <Box
        sx={{
          width: 222,
          height: 36,
          backgroundColor: "black",
          borderRadius: 36,
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <title>Location marker</title>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 1c2.4 0 4.9.9 6.7 2.8 3.7 3.7 3.7 9.8 0 13.4L12 24l-6.7-6.7c-3.7-3.7-3.7-9.8 0-13.5C7.1 1.9 9.6 1 12 1Zm0 18.8 4.6-4.6c2.5-2.6 2.5-6.7 0-9.3C15.4 4.7 13.7 4 12 4c-1.7 0-3.4.7-4.6 1.9-2.5 2.6-2.5 6.7 0 9.3l4.6 4.6Zm2-9.3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            fill="currentColor"
          ></path>
        </svg>
        <p> Enter delivery address </p>
      </Box>
      <Modal
        open={open}
        onClose={onChangeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <Box
              style={{
                width: 500,
                height: 216,
                backgroundColor: "white",
                borderRadius: 36,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h4"
                style={{ fontSize: 24, fontWeight: "bold" }}
              >
                Enter delivery address
              </Typography>
              <TextField
                style={{ width: "100%" }}
                InputProps={{ style: { borderRadius: "36px" } }}
                id="outlined-basic"
                label="Search for an address"
                variant="outlined"
              />
            </Box>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
