const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const LocalSchema = new Schema({
    url_id: {
        type: String,
        required: true
    },
    users_attending: {
        type: Array
    }
});

mongoose.model('places', LocalSchema);