const express = require("express")
const { UserModel } = require("../model/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { createClient } = require("redis");
const {BlacklistModel} = require("../model/block")
const client = createClient("redis://default:pAZIQGIYzeoDcfPm3PKrPU0gmPWpMeQo@redis-11856.c301.ap-south-1-1.ec2.cloud.redislabs.com:11856")
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();
const user_route = express.Router()
user_route.use(express.json());

user_route.post("/signup", async (req, res) => {
    const { name, email, pass } = req.body
    try {
        bcrypt.hash(pass, 4, async (err, hash) => {
            if (err) {
                console.log(err);
                res.send("something went wrong")
            } else {
                const user = new UserModel({ name, email, pass: hash })
                await user.save()
                res.json({ "msg": "signup successfull", user })
            }
        })
    } catch (error) {
        res.send("error in register the user")
        console.log(error);
    }

})

user_route.post("/login", async (req, res) => {
    const { email, pass } = req.body
    try {
        const user = await UserModel.find({ email })
        if (user.length > 0) {
            bcrypt.compare(pass, user[0].pass, async (err, result) => {
                if (result == true) {
                    const token = jwt.sign({ userId: user[0]._id }, "imran", {
                        expiresIn: "10h",
                    });
                    client.set("token", token);
                    res.send({ msg: "Login successful", token: token, user });
                } else if (result === false) {
                    res.send({ msg: "Wrong password" });
                }
            })
        }
        else{
            res.send({msg:"Please signup first"})
        }
    } catch (error) {
        res.json({ "msg": "Login failed Error in try" })
        console.log(error);
    }
})



/* user_route.get("/getnewtoken",(req,res)=>{
    const refresh_token = req.headers.authorization?.split(" ")[1]

    if(!refresh_token){
        res.send("login again")
    }else{
        jwt.verify(refresh_token,"R_token", function(err,decode){
            if(decode){
                const normal_token = jwt.sign({userID:decode._id, role: decode.role},"N_token",{expiresIn:60})
                res.send({msg:"login successful",normal_token})
            }else{
                res.send({msg:"Please login first",err})
            }
        })
    }
}) */

module.exports = { user_route }