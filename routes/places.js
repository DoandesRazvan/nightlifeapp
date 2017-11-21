
const express = require('express'),
      mongoose = require('mongoose'),
      methodOverride = require('method-override'),
      Yelp = require('yelp-api-v3'),
      {ensureAuthenticated} = require('../helpers/auth'),
      router = express.Router();

// yelp credentials
const yelp = new Yelp({
    app_id: 'QRfJ0TmbgKqc4N6vUywecg',
    app_secret: 'dtjXywHOhYhvJSzmemujTucUlYcY24knXotlcNKZEdrt6C0tFvzA6Dw0eDf27KIH'
})

// method override middleware (used for PUT request)
router.use(methodOverride('_method'));

// places schema
require('../models/Place');
const Place = mongoose.model('places');

// users schema
require('../models/User');
const User = mongoose.model('users');

router.get('/', (req, res) => {
    res.render('./sections/index');
});

router.post('/', (req, res) => {
    res.redirect('/' + req.body.location)
});

router.get('/:location', (req, res) => {
    var location = req.params.location;

    // sets up a path back for the login so that the user gets redirected back after the authentication process
    if (!req.user)
        req.session.returnTo = req.path;

    // searching for the nightlife places in the given location
    yelp.search({term: 'nightlife', location: location, limit: 20})
        .then(data => {
            let dataObj = JSON.parse(data),
                places = [];

            // creating an array of objects with all the places
            dataObj.businesses.forEach(currentPlace => {
                let placeObj = {
                    image: currentPlace.image_url,
                    id: currentPlace.id,
                    url: currentPlace.url,
                    name: currentPlace.name,
                    rating: currentPlace.rating,
                    phone: currentPlace.display_phone,
                    address: currentPlace.location.address1,
                    city: currentPlace.location.city,
                    zip: currentPlace.location.zip_code,
                    going: 0
                };

                places.push(placeObj);
            });

            // getting how many people are going for every place, from the database
            Place.find()
                 .then(savedPlaces => {
                     places.forEach(place => {
                        for (let x = 0; x < savedPlaces.length; x++) {
                            if (place.id == savedPlaces[x].url_id) {
                                place.going = savedPlaces[x].users_attending.length;
                                break;
                            }
                        }
                     });

                     res.render('./sections/index', {places: places, location: location});
                 })
        });
});

// runs when a user clicks the "people going" button
router.put('/:location', ensureAuthenticated, (req, res) => {
    var newPlace,
        id = req.body.id,
        user = req.user.username;
    
    // if the selected place already exists in the database increment the number of people that are going, otherwise save the place
    Place.findOne({url_id: id})
         .then(place => {
             if (place) {
                 let userIndex = place.users_attending.indexOf(user);

                 if (userIndex == -1) {
                     place.users_attending.push(user); 
                     
                     req.flash('success_msg', 'Your attendance was registered!');
                 } else {
                     place.users_attending.splice(userIndex, 1);

                     if (place.users_attending.length == 0)
                         place.remove();
                         
                     req.flash('success_msg', 'Your attendance has been cancelled!');
                 }

                 place.save();
             } else {
                 newPlace = new Place({
                     url_id: id,
                     users_attending: [user]
                 });
                 newPlace.save();
                 
                 req.flash('success_msg', 'Your attendance was registered!')
             };
             res.redirect('/' + req.params.location);
         });
});

module.exports = router;