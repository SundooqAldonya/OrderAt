# Food-delivery

This is Food Delivery api using graphQL, mongoose and Node

# Enatega Multivendor Api Readme

This README provides instructions on setting up and configuring the backend API for your project.

## Setup Instructions

### Step 1: Docker Setup

1. Make sure you have Docker installed on your machine. If not, you can download it [here](https://www.docker.com/get-started).
2. Once Docker is installed, navigate to the project directory in your terminal.

### Step 2: Environment Variables

After Docker setup, you need to configure the environment variables. Modify the `.env` file with your credentials.

If you do not find a .env file, create one in the root directory and paste the following contents into the .env file.

```bash
PORT=8001
CONNECTION_STRING=
RESET_PASSWORD_LINK=auth/reset/?reset=
SERVER_URL=https://enatega-multivendor.up.railway.app/
STRIPE_WEBHOOK_ENDPOINT_SECRET=
DASHBOARD_URL=https://practical-minsky-95a652.netlify.app/#/
WEB_URL=https://pensive-liskov-5320d4.netlify.app/
ORDER_DETAIL_WEB_URL=order-detail/
NODE_DEV=production
NODE_ENV=production
SENDGRID_API_KEY=
```

#### Environment Variables Explanation:

<div align="center">

</div>

#### Certainly, here’s a concise explanation of each variable in the .env file, its purpose, and how to create it:

- `PORT`: The port number on which the server will run.
- `CONNECTION_STRING`: This variable contains the connection string for your MongoDB database. It includes the username and password needed to connect to the database, as well as the cluster URL and some connection options. You might wonder what MongoDB is. MongoDB is a flexible NoSQL database known for storing data as JSON-like documents. It’s highly scalable, supports a rich query language, and is commonly used in applications like content management systems, e-commerce, and IoT. It offers high availability, and robust security, and has both a free community edition and a commercial enterprise edition. To get more information click read [more about MongoDB](https://www.mongodb.com/). Here’s how you can create the connection string for your version of this project. [MongoDB Configuration Video](https://youtu.be/YmdO3hw5DWU)

- `RESET_PASSWORD_LINK`: Link for resetting passwords.
- `SERVER_URL`: URL of your server.
- `STRIPE_WEBHOOK_ENDPOINT_SECRET`: This variable is used for Stripe webhook verification. It’s a secret key that Stripe uses to sign webhook events, ensuring their authenticity.
  **What is Stripe?** Stripe is a widely used online payment platform that helps businesses accept payments securely on their websites and apps. It’s known for its simplicity, global reach, and developer-friendly tools.
  **How to create a Stripe Endpoint Secret for this Project?**
  Here is how You can create Stripe endpoint Secrets
  [Stripe Configuration Video](https://youtu.be/A1XzDyaAS1k)
- `DASHBOARD_URL`: URL for the dashboard.
- `WEB_URL`: URL for the web application.
- `ORDER_DETAIL_WEB_URL`: URL for order details.
- `NODE_DEV`: Node development environment.
- `NODE_ENV`: Node environment.
- `SENDGRID_API_KEY`: Please enter your SendGrid API key if you intend to use SendGrid for sending emails; otherwise, leave this field empty..

### Step 3: Adding serviceAccountKey.json

Lastly, you need to add your own `serviceAccountKey.json`. This file is typically used for Firebase Admin SDK. Follow these steps to obtain and add the file:

1. Go to the [Firebase Console.](https://console.firebase.google.com/u/0/)
2. Select your project.
3. Navigate to Project Settings > Service accounts.
4. Click on "Generate new private key" to download the JSON file.
5. Replace the downloaded `serviceAccountKey.json` file in the project directory.

## Running the Backend

After completing the setup steps, you can start using your backend API. Simply run Docker and your API will be up and running, ready to serve your application.

Run the following command to build and start the Docker containers:

```bash
docker compose up --build
```

For any issues or further assistance, please refer to the project documentation or contact support.
