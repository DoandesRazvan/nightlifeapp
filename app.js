const express = require('express'),
      mongoose = require('mongoose'),
      path = require('path'),
      bodyParser = require('body-parser'),
      flash = require('connect-flash'),
      session = require('express-session'),
      cookieParser = require('cookie-parser'),
      passport = require('passport'),
      {ensureAuthenticated} = require('./helpers/auth'),
      app = express();

const port = process.env.PORT || 3000;

// map global promise - get rid of warning
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://admin:admin@ds159235.mlab.com:59235/thenightlife', {useMongoClient: true});

// routes
const users = require('./routes/users');
const places = require('./routes/places');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// express session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash middleware
app.use(flash());

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.user;

    next();
});

// passport config
require('./config/passport')(passport);

app.set('view engine', 'pug');

app.use('/users/', users);
app.use('/', places)

app.listen(port);