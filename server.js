require("dotenv").config();
const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const cors = require("cors");
const uuid = require('node-uuid');

// Create an Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = 'users';

app.get('/', (req, res) => {
  return res.send('Hello World!');
});

app.post('/users/create', (req, res) => {
  const { firstName, lastName } = req.body;

  const params = {
    TableName: tableName,
    Item: {
      id: uuid.v4(),
      firstName,
      lastName
    },
  };

  dynamoDB.put(params, (err, data) => {
    if (err) {
      console.error('Error creating item:', err);
      res.status(500).send('Error creating item');
    } else {
      res.send('Item created successfully');
    }
  });
});

app.get('/users/:userId', (req, res) => {
  console.log(req.params);
  const params = {
    TableName: tableName,
    Key: {
      'id': req.params.userId // Assuming 'id' is the primary key
    }
  };

  dynamoDB.get(params, (err, data) => {
    if (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
      res.status(500).send('Unable to read item');
    } else {
      console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
      res.status(200).json(data.Item);
    }
  });
})

app.get('/users', (req, res) => {
  const params = {
    TableName: tableName
  };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
      res.status(500).send('Error fetching users');
    } else {
      console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
      res.json(data.Items);
    }
  });
});

app.delete('/users/:userId', (req, res) => {
  console.log(req.params);
  const params = {
    TableName: tableName,
    Key: {
      'id': req.params.userId
    }
  };

  dynamoDB.delete(params, (err, data) => {
    if (err) {
      console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
      res.status(500).send('Unable to de;ete item');
    } else {
      console.log('DeleteItem succeeded:', JSON.stringify(data, null, 2));
      res.status(200).json(data.Item);
    }
  });
})

app.put('/users/:userId', (req, res) => {
  const { firstName, lastName } = req.body;
  const params = {
    TableName: tableName,
    Key: {
      id: req.params.userId
    },
    UpdateExpression: 'SET #firstName = :firstName, #lastName = :lastName',
    ExpressionAttributeNames: {
      '#firstName': 'firstName',
      '#lastName': 'lastName'
    },
    ExpressionAttributeValues: {
      ':firstName': firstName,
      ':lastName': lastName,
    }
  };

  dynamoDB.update(params, (err, data) => {
    if (err) {
      console.error("Unable to update user. Error JSON:", JSON.stringify(err, null, 2));
      res.status(500).json({ error: 'Unable to update item' });
    } else {
      console.log("UpdateUser succeeded:", JSON.stringify(data, null, 2));
      res.json({ message: 'User updated successfully' });
    }
  });
});

module.exports.handler = serverless(app);