const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const path = require('path');
require('dotenv').config();
// const { redirect } = require("express/lib/response");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/signup.html');
});

app.post('/', function (req, res) {
  // getting the data from the body object
  const { fname, lname, email } = req.body;

  // construct the JSON object that we want to send(search in the API documentation about add members(contacts) to an audience(list))
  const dataObject = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: fname,
      LNAME: lname,
    },
  }; // if you want to send more than one contact(member) you can constract the (members:[]) list then add all members objects you want(notice that we also need to remove /members section in the API end point ).

  // stringify the JSON Data.
  const dataString = JSON.stringify(dataObject);
  // construct the https request parameters.
  const url = 'https://us14.api.mailchimp.com/3.0/lists/e6f56b61ed/members';
  const options = {
    method: 'POST',
    auth: `hamza:${process.env.key}`,
  };
  const request = https.request(url, options, function (response) {
    if (response.statusCode != 200) {
      res.redirect('/failure.html'); //We can redirect to files only in the static folder.
    } else {
      res.redirect('/success.html');
    }
    response.on('data', function (data) {
      console.log(JSON.parse(data));
      console.log(response.statusCode);
    });
  });
  request.write(dataString);
  request.end();
});

app.post('/failure', (req, res) => {
  res.redirect('/');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('the server is started on port 3000');
});

//API Key
//*************************** */  --> the last part specify the region(data center)

//we went to mailchimp api and searched for the root url(endPoint) for API call and found this:
// ==>  https://<dc>.api.mailchimp.com/3.0/  ---> the <dc> part of the URL corresponds to the data center for your account. (my <dc> is us14).

// list or Audience id which will be found if i went to the targeted audience(list) and go to settings then select (audience name and defults)
// ==>  e6f56b61ed
