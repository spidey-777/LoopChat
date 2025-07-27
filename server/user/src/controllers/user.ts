import { generateToken } from "../config/generateToken.js";
import { publishTOQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/user.js";

export const loginUser = tryCatch(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    return res.status(429).json({
      message: "Too many requests. Please wait a minute before trying again.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 }); 
  await redisClient.set(rateLimitKey, "true", { EX: 60 }); 

  const message = {
    to: email,
    subject: "Your One Time Code",
    body: `Your one-time code is ${otp}. It is valid for 5 minutes.`,
  };

  await publishTOQueue("send-otp", message);

  return res.status(200).json({
    message: "OTP sent to your email",
  });
});




//verifying user


export const verifyUser = tryCatch(async(req,res)=>{
  const {email,otp:enteredOtp} = req.body;

  if(!email || !enteredOtp){
    res.status(400).json({
      message:"email and otp required",

    })
    return;
  }

  const otpKey = `otp:${email}`;

  const storedOtp = await redisClient.get(otpKey);

  if(!storedOtp || storedOtp !=enteredOtp){
    res.status(400).json({
      message:"invalid or expired otp"
    })
    return;
  }
  await redisClient.del(otpKey);
  let user = await User.findOne({email});

  if(!user){
    const name = email.slice(0,8);
    user = await User.create({name,email});
  }

    const token = generateToken(user);
    res.json({
      message:"user verified",
      user,
      token,
    })
})


//profile 

export const myProfile = tryCatch(async(req:AuthenticatedRequest,res)=>{
  const user  = req.user;

  res.json(user);

})


export const UpdateUser = tryCatch(async(req:AuthenticatedRequest,res)=>{
  const user = await User.findById(req?.user?._id);

  if(!user){
    res.status(404).json({
      message:"user not found"
    })
    return;
  }
  user.name = req.body.name;
  await user.save();
  const token = generateToken(user);
  res.json({
    message:"user updeted",
    user,
    token
  })
})

export const getAllUser = tryCatch(async (req:AuthenticatedRequest,res)=>{
  const users = await User.find();

  res.json(users)

})


export const getAUser = tryCatch(async(req,res)=>{
  const user = await User.findById(req.params.id);

  res.json(user);

})