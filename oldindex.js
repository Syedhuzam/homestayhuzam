const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors")
const flash = require('connect-flash');
const bodyParser = require('body-parser');

const dotenv = require("dotenv")
dotenv.config()
const usersRouter = require('./server/routes/userRoutes');
const bookingsRouter = require('./server/routes/bookingRoutes');
const roomsRouter = require('./server/routes/roomRoutes');
const transactionsRouter = require('./server/routes/transactionRoutes');
const adminRouter = require('./server/routes/adminRoutes')
var cookieParser = require('cookie-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo')
  

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User  = require('./server/models/userAccountsModel')

require('dotenv').config();

const app = express();


mongoose.connect(process.env.url)
.then(
    ()=>{
        console.log('database connected');
    },
    (err)=>{
        console.log('database connection error:',err)
    }

);
mongoose.pluralize(null)

app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));
app.use(bodyParser.json())
app.use('/static', express.static('public'));
app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');



// const roomsRouter = require('./server/routes/roomRoutes');
// const transactionsRouter = require('./server/routes/transactionRoutes');




app.use(cookieParser());
app.use('/public', express.static('public'));
app.use(cors())
app.use(express.json())
app.use(session({secret : 'not'}))
// const store = new MongoDBStore({
//     url: dbUrl,
//     secret,
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })
// const sessionConfig = {
//     store,
//     name: 'session',
//     secret,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         // secure: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }
//  
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use('/users', usersRouter);
app.use('/bookings', bookingsRouter);
app.use('/rooms', roomsRouter);
app.use('/payments', transactionsRouter);
app.use('/admin', adminRouter)

let port = process.env.PORT||5000

app.get("/",(req,res)=>{
    let user = {phone : "unknown",loggedIn:"false"}

    if(!req.session.user)//
    {
        user = user 
    }
    else 
    {
        user =  req.session.user 
    }
    return res.render("home",{user})
})


  app.listen(port, () => console.log("Server started"));