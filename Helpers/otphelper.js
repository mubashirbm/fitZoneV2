const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_SERVICE_ID

module.exports = {

    doSms: (userData) => {
        let res = {}
        return new Promise(async (resolve, reject) => {
            try {
                res = await client.verify.services(serviceSid).verifications.create({
                    to: `+91${userData.Phone}`,
                    channel: "sms"
                })
                res.valid = true;
                resolve(res)
            } catch (error) {
                reject(error)
            }
        })
    },

    otpVerify: (otpData, userData) => {
        let resp = {}
        console.log(otpData,userData,"otp");
        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${userData.Phone}`,
                code: otpData.otp
            }).then((verification) => {
                console.log("verification success");
                resolve(verification.valid)
            }).catch((err) => {
                reject(err)
            })
        })
    }



}



