const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, },
    (err) => {
    if (!err) {
        console.log('Yey! MongoDB connection works well!!!');
    } else {
        console.log('Damn it! DB error connection:' + JSON.stringify(err, undefined, 2));
    }
});

module.exports = mongoose;
