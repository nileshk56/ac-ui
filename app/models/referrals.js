var Base = require('./base.js')

class Referrals extends Base {

    //fetch referral data of user id
    fetchReferralsData(params, cb) {
        
        var qr = "SELECT *, referrals.status as referral_status, referrals.created as referral_created FROM users, referrals WHERE users.user_id = referrals.user_id and referrals.parent_referral_code = '" + params.parent_referral_code + "' ORDER BY referrals." + params.orderBy + " LIMIT " + params.offset + ",  " + params.limit;
        console.log("Asdfasfwqwr", qr)
        app.db.mysql.query(qr, cb)
    }
}

module.exports = Referrals;