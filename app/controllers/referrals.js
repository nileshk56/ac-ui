var Base = require('./base.js');
var modelReferrals = new (require('../models/referrals.js'))();

class Referrals extends Base {

    renderRefferals(req, res) {
        
        var pageLimit = 10;

        app.lib.async.auto({

            fetchReferralCodeOFUser : function(icb) {
                modelReferrals.fetch("referrals", '*', {user_id : req.session.user.user_id}, null, null,null, icb);
            },

            fetchTotalStats : ['fetchReferralCodeOFUser', function(results, icb) {
                modelReferrals.fetch("referrals", '*', {parent_referral_code : results.fetchReferralCodeOFUser[0][0]['referral_code']}, null, null,null, icb);        
            }],

            fetchReferralData : ['fetchReferralCodeOFUser', function(results, icb){ 
                
                var offset = !req.query.page ? 0 : pageLimit * parseInt(req.query.page);

                var params = {
                    limit : pageLimit,
                    offset : offset,
                    orderBy : 'created DESC',
                    parent_referral_code : results.fetchReferralCodeOFUser[0][0]['referral_code']
                };
                
                modelReferrals.fetchReferralsData(params, icb)
            }]

        }, function(err, results){ 
            if(err) 
                return res.redirect('/error');

            console.log(results.fetchReferralCodeOFUser, 'sdf',results.fetchReferralCodeOFUser[0],'345', results.fetchReferralCodeOFUser[0]['referral_code'], 'adf456' );

            var objTotalData = results.fetchTotalStats[0];    

            var objRefStats = {
                totalReferralBTCAmount : 0,
                totalPaidReferralBTCAmount : 0,
                totalUnaidReferralBTCAmount : 0
            };

            for(var i = 0; i < objTotalData.length; i++) {
                if(objTotalData[i].status == 'PAID') {
                    objRefStats.totalPaidReferralBTCAmount ++;
                } else {
                    objRefStats.totalUnaidReferralBTCAmount ++;
                }
            }

            objRefStats.totalReferralBTCAmount = objTotalData.length * app.config.referral.amount.BTC;
            objRefStats.totalPaidReferralBTCAmount = objRefStats.totalPaidReferralBTCAmount * app.config.referral.amount.BTC;
            objRefStats.totalUnaidReferralBTCAmount = objRefStats.totalUnaidReferralBTCAmount * app.config.referral.amount.BTC;

            var strPagination = "";
            if(objTotalData) {
                var page = req.query.page ? req.query.page : 0;
                for(var j = 1; j<=Math.ceil(objTotalData.length/pageLimit); j++) {
                    var activeClass = j-1 == page ? 'class = "active"' : '';
                    strPagination += "<li "+activeClass+"><a href=\"/referrals?page="+(j-1)+"\">" + j + "</a></li>";
                }
            }
            
            var viewData = {
                refStats : objRefStats,
                referrals : results.fetchReferralData[0],
                user : req.session.user,
                strPagination : strPagination,
                refDet : results.fetchReferralCodeOFUser[0][0]
            };
    
            res.render('referrals', viewData);    
        });
    }
}

module.exports = Referrals;