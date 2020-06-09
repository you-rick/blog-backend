const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

const {config} = require('./config/config');
const {mongoose} = require('./db');
const {passportConfig} = require('./config/passportConfig');

let userController = require('./controllers/userController');
let articleController = require('./controllers/articleController');

var app = express();
// save images here
app.use('/uploads', express.static('uploads'));
// added Limit, because base64 image has problems
app.use(bodyParser.json({limit: '20mb'}));
//fixing CORS problem
app.use(cors({origin: 'http://localhost:4200'}));
app.use(passport.initialize());

app.listen(process.env.PORT, () => console.log(`Server started at port : ${process.env.PORT}`));

app.use('/auth', userController);
app.use('/articles', articleController);

// base error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
});
