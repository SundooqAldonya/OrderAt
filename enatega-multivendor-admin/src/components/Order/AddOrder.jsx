import React, { useState ,useEffect} from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField ,Select,MenuItem, FormControl, InputLabel} from '@mui/material';
import { validateFunc } from '../../constraints/constraints'
import Button from '@mui/material/Button';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom'; 
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import GooglePlacesAutocomplete from "react-google-autocomplete";
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import useGlobalStyles from '../../utils/globalStyles'
const CHECKOUT_PLACE_ORDER = gql`
  mutation CheckOutPlaceOrder($userId: ID!, $resId : String! ,  $addressId: ID!, $orderAmount: Float!) {
    CheckOutPlaceOrder(userId: $userId, resId : $resId , addressId: $addressId, orderAmount: $orderAmount) {
      _id
      orderId
      resId
      user {
        _id
        name
        phone
      }
      deliveryAddress {
        id
        deliveryAddress
        details
        label
      }
      orderAmount
      paymentStatus
      orderStatus
      isActive
      createdAt
      updatedAt
    }
  }
`;
const FIND_OR_CREATE_USER = gql`
  mutation FindOrCreateUser($userInput: UserInput!) {
    findOrCreateUser(userInput: $userInput) {
      _id
      name
      phone
      governate
      address_free_text
      addresses {
        _id
        deliveryAddress
        details
        label
        selected
        isActive
      }
    }
  }
`;
const GET_USERS_BY_SEARCH = gql`
  query Users($search: String) {
    search_users(search: $search) {
    _id
      name
      email
      phone
      addresses {
        _id
        deliveryAddress
        details
        label
        selected
        createdAt
        updatedAt
      }
    }
  }
`;
const AddOrder = ({ t, onSubmit, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [PhoneError, setPhoneError] = useState(false)
  const [searchTrigger, setSearchTrigger] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [longitude , setLongitude] = useState();
  const [latitude , setLatitude] = useState();
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phoneNumber: '',
    address: '' ,
    governate : '' , 
    address_free_text :''
  });
  const [cost, setCost] = useState('');
  const [success, setSuccess] = useState('');
  const [orderMode, setOrderMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // To store the selected customer data
  const [selectedAddress, setSelectedAddress] = useState('');
  const [checkOutPlaceOrder] = useMutation(CHECKOUT_PLACE_ORDER);
  const handleSearchChange = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, '');
    setSearchQuery(newValue);
  };
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    phoneNumber: false,
    address: false,
    governate : false , 
    address_free_text : false
  });
  
  const globalClasses = useGlobalStyles()
  const handleSearchClick = () => {
     if(searchQuery.trim()== ''){
      setPhoneError(true)
      return;
     }else{
      setPhoneError(false)
     }
    setSearchTrigger(searchQuery);
  };
  const { loading, error, data } = useQuery(GET_USERS_BY_SEARCH, {
    variables: { search: searchTrigger },
    skip: !searchTrigger,
  });
  useEffect(() => {
    if (data && data.search_users && data.search_users.length > 0) {
      setSelectedCustomer(data.search_users[0]);
  
      // Set selected address when selectedCustomer is available
      if (data.search_users[0].addresses && data.search_users[0].addresses.length > 0) {
        setSelectedAddress(data.search_users[0].addresses[0].deliveryAddress);
      }
  
      setOrderMode(true);
    }
  }, [data]);
  
  // Handle selectedAddress update when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer && selectedCustomer.addresses && selectedCustomer.addresses.length > 0) {
      setSelectedAddress(selectedCustomer.addresses[0].deliveryAddress);
    }
  }, [selectedCustomer]);
  const [findOrCreateUser] = useMutation(FIND_OR_CREATE_USER);
  const handleAddCustomer = (event) => {
    event.preventDefault();
    setOpenModal(true);
  };
  const handleInputChange = (event) => {
    const { name, governate , address_free_text , address , latitude , longitude , value } = event.target;

    console.log(name, governate , address_free_text , address , value , latitude , longitude , 'uiusdiuaiduai')
  
    if(latitude){
      setLatitude(latitude)
    }
    if(longitude){
      setLongitude(longitude)
    }
    // Regular expression to allow only alphabets and spaces
    const regex = /^[A-Za-z\s]*$/;
  
    // If the value matches the regex or is empty (to allow deletion), update the state
    
      setNewCustomer((prevCustomer) => ({
        ...prevCustomer,
        [name]: value,
        [governate]: value,
        [address_free_text]: value,
        [address]: value,
      }));
    
  };
  
  const validateForm = () => {
    const errors = {};
    errors.name = newCustomer.name.trim() === '';  // Validate name
   // errors.address = newCustomer.address.trim() === '';  // Validate address
    errors.governate = newCustomer.governate.trim() === '';  // Validate address
    errors.address_free_text = newCustomer.address_free_text.trim() === '';  // Validate address
  
    setValidationErrors(errors);
  
    // Return true if no errors, false otherwise
    return !Object.values(errors).includes(true);
  };
  const handleSubmitCustomer = async() => {
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
  
    try {
      const { data } = await findOrCreateUser({
        variables: {
          userInput: {
            name: newCustomer.name,
            governate: newCustomer.governate,
            address_free_text: newCustomer.address_free_text,
            phone: searchQuery,
            addresses: [
              {
                latitude:latitude,
                longitude:longitude,
                deliveryAddress: newCustomer.address,
                label: 'Home',
                selected: true,
              },
            ],
          },
        },
      });
  
      // Clear the form after successful creation
      setNewCustomer({ name: '', phoneNumber: '', address: '' , governate : '' , address_free_text : '' });
  
      // Display success message
      setSuccess('Customer Created Successfully!');
      
      // Automatically close the modal after showing success
      setTimeout(() => {
        setOpenModal(false); // Close modal
        setSuccess(''); // Clear success message
      }, 3000); // 3 seconds timeout
  
      const createdCustomer = data.findOrCreateUser;
  
      setSelectedCustomer(createdCustomer);
      setOrderMode(true);
    } catch (error) {
      console.error('Error adding customer:', error);
      setSuccess("An error occurred while creating the customer. Please try again.");
    }
  };
  
  const handleCostChange = (event) => {
    const value = event.target.value;
    if (value === '' || !isNaN(value)) {
      setCost(value);
    }
  };
  const handleSubmitOrder = async() => {

    const restaurantId = localStorage.getItem('restaurantId')

    try {
      if (!cost || !selectedCustomer || !selectedAddress) {
        throw new Error("Cost, customer details, and address are required!");
      }
  
      const { _id, addresses } = selectedCustomer;
  
      // Find the addressId based on the selected address
      const selectedAddressData = addresses.find(
        (address) => address.deliveryAddress === selectedAddress
      );
      if (!selectedAddressData) {
        throw new Error("Selected address not found.");
      }
      const addressId = selectedAddressData._id;
  
      const orderAmount = parseFloat(cost);
      if (isNaN(orderAmount) || orderAmount <= 0) {
        throw new Error("Please enter a valid cost greater than 0.");
      }
  
      // Call the checkout mutation
      const { data } = await checkOutPlaceOrder({
        variables: {
          userId: _id,
          addressId,
          resId:restaurantId,
          orderAmount,
        },
      });
  
      console.log("Order placement response:", data);
      const orderId = data.CheckOutPlaceOrder.orderId;
      console.log("Order ID:", orderId);
  
      setSuccess("Order Created Successfully!");
      console.log("Order placed:", data.CheckOutPlaceOrder);
      setOrderMode(false); 
  
    } catch (err) {
      console.error("Error placing order:", err);
      setSuccess(`Error: ${err.message}`);
    }
  };
  if (orderMode) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 2,
          marginTop: 2,
          marginBottom: 2,
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
          boxShadow: 3,
        }}
      >
        {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            color: 'white', // Text color
            backgroundColor: '#32620e', // Background color
            fontWeight: 'bold',
            "& .MuiAlert-icon": {
              color: 'white', // Icon color
            },
          }}
        >
          {success}
        </Alert>
      )}


        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          {t('Create Order')}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Phone Number</Typography>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedCustomer?.phone || ''}
            disabled
            sx={{
              '& .MuiInputBase-input': { color: 'black' },
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Name</Typography>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedCustomer?.name || ''}
            disabled
            sx={{
              '& .MuiInputBase-input': { color: 'black' },
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Address</Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select
              labelId="address-select-label"
              value={selectedAddress || ''}
              onChange={(e) => setSelectedAddress(e.target.value)}
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            >
              {selectedCustomer?.addresses.map((address, index) => (
                <MenuItem key={index} value={address.deliveryAddress} sx={{ color: 'black' }}>
                  {address.deliveryAddress}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Cost</Typography>
          <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              value={cost}
              onChange={handleCostChange}
              error={!!cost && (isNaN(cost) || parseFloat(cost) <= 0)}  // Error when cost is invalid
              helperText={cost && (isNaN(cost) || parseFloat(cost) <= 0) ? 'Please enter a valid cost greater than 0' : ''}
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
/>
        </Box>
        {/* Submit and Cancel Buttons */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmitOrder}
          >
            Submit Order
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setOrderMode(false)}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }
  return (
   <Box
      sx={{
        backgroundColor: 'white',
        padding: 2,
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        boxShadow: 3,
      }}
    >
      {/* Success  Message Alert */}
      {success && (
        <Alert
          className="alertSuccess"
          variant="filled"
          severity="success"
          style={{ marginBottom: '20px' }}
        >
          {success}
        </Alert>
      )}
      <h2>{t('Search Customer')}</h2>
      <Box>
  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
    Phone Number
  </Typography>
  <TextField
  placeholder="Phone Number"
  variant="outlined"
  fullWidth
  margin="normal"
  sx={{
    '& .MuiInputBase-input': { color: 'black' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, 
      '& fieldset': { borderColor: '#ccc' },
      '&:hover fieldset': { borderColor: '#888' },
      '&.Mui-focused fieldset': { borderColor: '#000' },
    },
  }}
      value={searchQuery}
      onChange={handleSearchChange}
      onInput={(e) => {
        // Only allow numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');  // Replace any non-numeric character with an empty string
      }}
      className={PhoneError !== undefined && 
        (PhoneError ? globalClasses.inputError : globalClasses.inputSuccess)}
    />
    </Box>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSearchClick} // Trigger the query on click
        style={{ marginTop: '10px' }}
      >
        Search Customer
      </Button>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
  {loading && <p>Loading...</p>}
  {!success && error && (
    <>
      <div>
        <p style={{ color: 'red', margin: '0 0 10px 0' }}>
          User does not exist.
        </p>
      </div>
      {error.message.includes("No users found matching the search criteria") && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCustomer}
        >
          {t('Add Customer')}
        </Button>
      )}
    </>
  )}
</div>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
    <DialogTitle sx={{ color: 'black' }}>Add New Customer</DialogTitle>
    <DialogContent>
   
        {/* Phone Number Field */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
            Phone Number
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{
              '& .MuiInputBase-input': { color: 'black' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, 
                '& fieldset': {
                  borderColor: '#ccc',  // No validation styles now
                  borderWidth: 1,  
                },
                '&:hover fieldset': { borderColor: '#888' },
                '&.Mui-focused fieldset': { 
                  borderColor: '#000',
                  borderWidth: 1,
                },
              },
            }}
            name="phoneNumber"
            value={searchQuery} // Ensure the phone number value comes from searchQuery
            onChange={handleInputChange} // Handle input change
          />
        </Box>

      {/* Name Field */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
          Name
        </Typography>
        <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, 
                  '& fieldset': {
                    borderColor: validationErrors.name ? 'red' : '#ccc', 
                    borderWidth: validationErrors.name ? 2 : 1,  
                  },
                  '&:hover fieldset': { borderColor: validationErrors.name ? 'red' : '#888' },
                  '&.Mui-focused fieldset': { 
                    borderColor: validationErrors.name ? 'red' : '#000',
                    borderWidth: validationErrors.name ? 2 : 1,
                  },
                },
              }}
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              error={validationErrors.name || newCustomer.name && !/^[A-Za-z\s]*$/.test(newCustomer.name)} 
            />
      </Box>

       {/* Governate Field */}
       <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
          Governate
        </Typography>
        <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, 
                  '& fieldset': {
                    borderColor: validationErrors.governate ? 'red' : '#ccc', 
                    borderWidth: validationErrors.governate ? 2 : 1,  
                  },
                  '&:hover fieldset': { borderColor: validationErrors.governate ? 'red' : '#888' },
                  '&.Mui-focused fieldset': { 
                    borderColor: validationErrors.governate ? 'red' : '#000',
                    borderWidth: validationErrors.governate ? 2 : 1,
                  },
                },
              }}
              name="governate"
              value={newCustomer.governate}
              onChange={handleInputChange}
              error={validationErrors.governate || newCustomer.governate && !/^[A-Za-z\s]*$/.test(newCustomer.governate)} 
            />
      </Box>


    


      {/* Address Field */}
      <Box sx={{ position: 'relative' }}>
  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold", color: "black" }}>
    Address
  </Typography>
  <GooglePlacesAutocomplete
    apiKey="AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY" // Replace this with your Google API key
    onPlaceSelected={(place) => {
      const selectedAddress = place.formatted_address || place.name;

      const latitude = place.geometry?.location?.lat() ?? null; // Get latitude
      const longitude = place.geometry?.location?.lng() ?? null; // Get longitude

      handleInputChange({
        target: {
          name: "address",
          value: selectedAddress,
          latitude: latitude,
          longitude: longitude,
        },
      });
    }}
    options={{
      types: ["address"],
      componentRestrictions: { country: "in" },
    }}
    style={{
      width: "100%",
      padding: "16.5px 14px",
      borderRadius: "4px",
    //  border: `1px solid ${validationErrors.address ? "red" : "#ccc"}`,
      marginBottom: "1rem",
      color: "black",
      fontSize: "16px",
      outline: "none",
    }}
    containerStyle={{
      position: "absolute", // Dropdown will appear right under the input
      top: "100%",
      left: 0,
      zIndex: 2000, // Ensures dropdown is above the modal
    }}
    className="custom-autocomplete-input"
  />
  {/* {validationErrors.address && (
    <Typography variant="caption" sx={{ color: "red", mt: 1 }}>
      Please enter a valid address.
    </Typography>
  )} */}
</Box>


         {/* Address free text Field */}
         <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
          Address Free Text
        </Typography>
        <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, 
                  '& fieldset': {
                    borderColor: validationErrors.address_free_text ? 'red' : '#ccc', 
                    borderWidth: validationErrors.address_free_text ? 2 : 1,  
                  },
                  '&:hover fieldset': { borderColor: validationErrors.address_free_text ? 'red' : '#888' },
                  '&.Mui-focused fieldset': { 
                    borderColor: validationErrors.address_free_text ? 'red' : '#000',
                    borderWidth: validationErrors.address_free_text ? 2 : 1,
                  },
                },
              }}
              name="address_free_text"
              value={newCustomer.address_free_text}
              onChange={handleInputChange}
              error={validationErrors.address_free_text || newCustomer.address_free_text && !/^[A-Za-z\s]*$/.test(newCustomer.address_free_text)} 
            />
      </Box>


    </DialogContent>

    <DialogActions>
      <Button onClick={() => setOpenModal(false)} color="secondary">
        Cancel
      </Button>
      <Button 
        onClick={handleSubmitCustomer} 
        color="primary" 
        variant="contained" 
      >
        Submit
      </Button>
    </DialogActions>
  </Dialog>

    </Box>
  );
};
AddOrder.propTypes = {
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
export default AddOrder;
