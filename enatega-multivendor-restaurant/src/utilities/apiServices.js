// import axios from "axios"

import axios from "axios"

// const base_url = 'https://query.orderat.ai/graphql/'

// const searchCustomers = async(search) =>{
//     const response = await axios.get(`${base_url}+search_users?search=${search}`)
//     return response.data;
// }
// export {searchCustomers}
const auth_token ={auth_token:""}
const url = "https://www.universal-tutorial.com/api"
const token = "nzu3zF6IpFPbvb-8-JY6dwcOJsKDhqXbW4bLkbWjrtt0ldh0ZHc0tTkr0GfqOSdaM4U"
const getAccessToken = async() =>{
    const response = await axios.get(`${url}/getaccesstoken`,{
        headers:{
            "Accept": "application/json",
            "api-token": token,
            "user-email": "manmohan.dev01@gmail.com"
        }
    });
    console.log(auth_token)
    return response;
}
const getGovernate = async () =>{
    const response = await axios.get(`${url}/states/Egypt`,{
        headers:{
            Authorization:`Bearer ${auth_token.auth_token}`,
            "Accept": "application/json",
        }
    });
    console.log(auth_token)
    return response;
}
const getCities = async (state) =>{
    const response = await axios.get(`${url}/cities/${state}`,{
        headers:{
            Authorization:`Bearer ${auth_token.auth_token}`,
            "Accept": "application/json",
        }
    });
    console.log(auth_token)
    return response;
}
export {getAccessToken,auth_token,getGovernate,getCities}