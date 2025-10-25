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
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import useGlobalStyles from '../../utils/globalStyles'
const CHECKOUT_PLACE_ORDER = gql`
  mutation CheckOutPlaceOrder($userId: ID!, $addressId: ID!, $orderAmount: Float!) {
    CheckOutPlaceOrder(userId: $userId, addressId: $addressId, orderAmount: $orderAmount) {
      _id
      orderId
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
  const [PhoneError, setPhoneError] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phoneNumber: '',
    address: ''
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
    address: false
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
    const { name, value } = event.target;
    setNewCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };
  const validateForm = () => {
    const errors = {};
    errors.name = newCustomer.name.trim() === '';  // Validate name
    errors.address = newCustomer.address.trim() === '';  // Validate address
  
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
            phone: searchQuery,
            addresses: [
              {
                deliveryAddress: newCustomer.address,
                label: 'Home',
                selected: true,
              },
            ],
          },
        },
      });
  
      // Clear the form after successful creation
      setNewCustomer({ name: '', phoneNumber: '', address: '' });
  
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
      {/* Success Message Alert */}
      {error && (
          <Alert
            className="alertError"
            variant="filled"
            severity="error"  // Red alert with cross icon
            style={{ marginBottom: '20px' }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            className="alertSuccess"
            variant="filled"
            severity="success"  // Green alert with check icon
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
            '& fieldset': {
              borderColor: PhoneError ? 'red' : '#ccc', // Red border when error occurs
              borderWidth: PhoneError ? 2 : 1,  // Bold border (2px) when error occurs
            },
            '&:hover fieldset': { borderColor: PhoneError ? 'red' : '#888' }, // Border color on hover
            '&.Mui-focused fieldset': { 
              borderColor: PhoneError ? 'red' : '#000', // Focused state border color
              borderWidth: PhoneError ? 2 : 1, // Bold border when focused and error is present
            },
          },
        }}
        value={searchQuery}
        onChange={handleSearchChange}
        onInput={(e) => {
          // Only allow numeric characters
          e.target.value = e.target.value.replace(/[^0-9]/g, '');  // Replace any non-numeric character with an empty string
        }}
        error={PhoneError}  // This will trigger the error styling, but will not display the error message
        helperText={PhoneError ? "" : ""} // Don't display the helper text
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
      <div style={{ marginTop: '20px' }}>
        {loading && <p>Loading...</p>}
        {!success && error && (
          <>
            <p style={{ color: 'red', display: 'inline' }}>
              User does not exist.
            </p>
            {error.message.includes("No users found matching the search criteria") && (
              <a
                href="#"
                onClick={handleAddCustomer}
                style={{
                  color: 'blue',
                  textDecoration: 'underline',
                  marginLeft: '10px', 
                }}
              >
                Add Customer
              </a>
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
          error={validationErrors.name ? true : false} 
        />
      </Box>
      {/* Address Field */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
          Address
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
                borderColor: validationErrors.address ? 'red' : '#ccc', 
                borderWidth: validationErrors.address ? 2 : 1,  
              },
              '&:hover fieldset': { borderColor: validationErrors.address ? 'red' : '#888' },
              '&.Mui-focused fieldset': { 
                borderColor: validationErrors.address ? 'red' : '#000',
                borderWidth: validationErrors.address ? 2 : 1,
              },
            },
          }}
          name="address"
          value={newCustomer.address}
          onChange={handleInputChange}
          error={validationErrors.address ? true : false} 
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
