const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const verifyToken = require('./routes/verifyToken');
const subscriptionRoutes = require('./routes/packages');
const photoRoutes = require('./routes/photoRoutes');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middlewares/authenticateToken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/users',authenticateToken, usersRouter);
app.use('/', loginRouter);
app.use('/', registerRouter);
app.use('/api/auth', authRoutes);
app.use('/', verifyToken);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/photos', photoRoutes);


app.use(function(req, res, next) {
  res.status(404).send('404 - Not Found');
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', { error: err });
});

const cron = require('node-cron');
const User = require('./models/User');

cron.schedule('0 0 * * *', async () => {
  try {
    const users = await User.findAll();
    for (let user of users) {
      user.UploadCount = 0;
      user.StorageUsed = 0.0;
      await user.save();
    }
    console.log('Reset upload counts and storage used for all users');
  } catch (error) {
    console.error('Error resetting upload counts and storage used:', error);
  }
});


module.exports = app;
