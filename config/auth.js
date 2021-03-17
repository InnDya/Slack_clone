module.exports = {
    ensureAuthenticated: (request, response, next) => {
        if (request.isAuthenticated()) {
            return next();
        } else {
            request.flash('error_msg', 'Please login to view this resourse');
            response.redirect('/login');
        }
    }
}