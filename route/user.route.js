const express = require("express")
const {UserModel} = require("../model/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const redis = require("redis")

const client= redis.createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();


const user_route = express.Router()

user_route.post("/signup",async (req,res)=>{
    const {name,email,pass} = req.body
    try {
        bcrypt.hash(pass,4 ,async (err,secure_pass)=>{
            if(err){
                console.log(err);
                res.send("something went wrong")
            }else{
                const user = new UserModel({name, email, pass:secure_pass})
                await user.save()
                res.json({"msg":"signup successfull"})
            }
        })
    } catch (error) {
        res.send("error in register the user")
        console.log(error);
    }
    
})

user_route.post("/login", async (req,res)=>{
    const {email,pass} = req.body
    try {
        const user = await UserModel.findOne({email})
        if(!user){
            res.json({"msg":"Please signup first"})
        }else{
            const hash_pass = user?.pass;//user?.pass;----------if the user is there next go to the further process othervicw not...
            bcrypt.compare(pass, hash_pass,async (err, result)=>{
            if(result){
                const token = jwt.sign({userID:user._id, role : user.role},"N_token", {expiresIn: '3h'});
                const response = await client.SETEX("token" ,320 ,token)
                res.json({"msg":"Login successfully"})
            }else{
                console.log(err);
               res.json({"msg":"Wrong Credentials"})
            }
        })
        }
    } catch (error) {
       res.json({"msg":"Login failed Error in try"})
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

module.exports = {user_route}