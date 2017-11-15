module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) 
            return next();

        req.flash('error_msg', 'Please login! Unauthorized action.');

        console.log(req.session.returnTo);

        res.redirect('/users/login');
    }
}