const mongoose=require("mongoose")
const userSchema= mongoose.Schema({
 name:{
    type: String,
    required: false,
  },
 email:{
    type: String,
    required: true,
  },
 pass:{
    type: String,
    required: true,
  }
})

const UserModel=mongoose.model("Dexter",userSchema)

module.exports={
 UserModel
}