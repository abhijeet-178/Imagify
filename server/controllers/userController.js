import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import razorpay from 'razorpay'
import transactionModel from '../models/transactionModel.js';

 export const registerUser = async (req,res)=>{
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.json({
                success:false,
                message:"Missing Details"
            })
        }
        const hashPass = await bcrypt.hash(password,10)
        const userData = {
            name,email,password:hashPass
        }
        const newuser = new userModel(userData)
        const user = await newuser.save();

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({
            success:true,
            token,
            user:{name:user.name}
        })
        
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

 export const loginUser = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({
                success:false,
                message:"User doesn't exist"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({
                success:true,
                message:'Successfully logged in',
                token,
                user:{name:user.name}
            })
        }else{
            return res.json({
                success:false,
                message:"Bad Credentials"
            })
        }
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}
export const userCredits = async(req,res)=>{
        try {
            const {userId} = req.body;
            const user = await userModel.findById(userId)
            return res.json({
                success:true,
                credits:user.creditBalance,
                user:{
                    name:user.name
                }
            })
        } catch (error) {
            return res.json({
                success:false,
                message:error.message
            })
        }
}
 const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SERCRET
});
export const paymentRazorpay = async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { planId } = req.body;
    console.log("UserID:", userId);
    console.log("PlanID:", planId);

    if (!userId || !planId) {
      return res.json({ success: false, message: "Missing Details" });
    }

    let credits, plan, amount, date;
    switch (planId) {
      case "Basic":
        plan = "Basic";
        amount = 10;
        credits = 100;
        break;
      case "Advanced":
        plan = "Advanced";
        amount = 50;
        credits = 500;
        break;
      case "Business":
        plan = "Business";
        amount = 250;
        credits = 5000;
        break;
      default:
        return res.json({ success: false, message: "Plan not found" });
    }

    date = Date.now();
    const transactionData = { userId, plan, amount, credits, date };
    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id.toString(),
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
