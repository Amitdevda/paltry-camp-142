const jwt = require("jsonwebtoken")
const redis = require("redis")

const client = redis.createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();


const authenticate = async(req,res,next)=>{
     //const token = req.headers.authorization?.split(" ")[1]
    const token = await client.GET("token")
    //console.log(token);token is not there it will throw ***null***

    if (!token) {
        res.send("Token not available, login again")
    } else {
        //blacklist token
        //const blacklisted_data = JSON.parse(fs.readFileSync("./blacklist.json","utf-8"));
        let token_checking = await client.SREM("logout", token)//=> either 0 or 1
        //console.log(token_checking)
        if (token_checking == 1) {
            res.send("Login again")
        } else {
            // token verification
            if (token) {
                jwt.verify(token, "N_token", function (err, decode) {
                    if (decode) {
                        // const userrole = decode?.role
                        // req.body.userrole = userrole
                        next()
                    } else {
                        res.send({ msg: "please login first", err })
                    }
                })

            } else {
                res.send("This route has been producted, Please login first")
            }
        }
    }
}

module.exports = {authenticate}