const express = require("express")
const {connection} = require("./config/db")
const {user_route} = require("./route/user.route")
const {authenticate} = require("./middleware/auth.middleware")
const redis = require("redis")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client_id="23ca205a4e951b3d0464"
const client_secret="a40831240ce5aeab012a248c9e5069152dcf2976"

const client= redis.createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();



const app = express()
app.use(express.json())

app.get("/",(req,res)=>{
        res.send("welcome");
})
app.get("/welcome",(req,res)=>{
        res.sendFile(__dirname + "/signin.html");
})

app.use("/",user_route)

/* app.use(authenticate)
 */
app.get("/room",async(req,res)=>{
  const{code}=req.query
  const response=await fetch("https://github.com/login/oauth/access_token",{
    method:"POST",
    Headers:{
    Accept:"application/json",
    "content-type":"application/json"
    },
    body:JSON.stringify({
    client_id,
    client_secret,
    code
    })
  })
  const text = await response.text();
const data = querystring.parse(text);
const access_token = data.access_token;
console.log("Access token:", access_token);
    res.send("products")
})


app.get("/logout", async(req, res) => {
   const token = await client.GET("token")
    //redis
    if(!token){
        res.send("token expired login again")
    }else{
        await client.SADD("logout", token)
        //file
            // const blacklisted_data = JSON.parse(fs.readFileSync("./blacklist.json","utf-8"));
            // blacklisted_data.push(token)
            // fs.writeFileSync("./blacklist.json", JSON.stringify(blacklisted_data))
        // console.log(blacklisted_data);
        res.send("Logout successfully");
    }

})


app.listen(3000,async ()=>{
    try {
        await connection
        console.log("DB connected");
    } catch (error) {
        console.log(error);
        console.log("DB dose not connected");
    }
    console.log("Port @ localhost:3000");
})