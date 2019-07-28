const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-auth-token'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
  next();
});

// Connect Datababase
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

//Get route files
//const content = require('./routes/api/cms/content');
const auth = require('./routes/api/app/auth');
const verify = require('./routes/api/app/verify');
const users = require('./routes/api/app/users');

// Define Routes
//app.use('/api/cms/content', content);
app.use('/api/app/auth', auth);
app.use('/api/app/verify', verify);
app.use('/api/app/users', users);

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   // Set static folder
//   app.use(express.static('clinet/build'));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
