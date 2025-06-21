
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Replace with your actual credentials
const consumerKey = 'bmz';  
const consumerSecret = 'YPctj'; 
const shortcode = '174379'; // Safaricom sandbox shortcode
const passkey = 'YOUR_LIPA_NA_MPESA_PASSKEY'; // Replace with your M-Pesa sandbox passkey
const callbackURL = 'https://yourdomain.com/callback'; // You can replace with your live callback URL

const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
let accessToken = "";

app.get('/token', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );
    accessToken = data.access_token;
    res.send(data);
  } catch (error) {
    res.status(500).send(error.response.data);
  }
});

app.post('/stkpush', async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

  const { phone, amount } = req.body;

  try {
    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackURL,
        AccountReference: 'E-comLoan',
        TransactionDesc: 'Loan Insurance Fee'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    res.send(data);
  } catch (error) {
    res.status(500).send(error.response.data);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
