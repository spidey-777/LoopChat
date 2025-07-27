import { NextFunction, Request, Response } from "express";
import jwt,{JwtPayload} from 'jsonwebtoken'

interface IUser extends Document{
    _id:string;
    name:string;
    email:string;
}

export interface AuthenticatedRequest extends Request{
    user?: IUser | null;

}


const  isAuth  = async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"please login -no authHeader"
            })
            return;
        }
         const token  = authHeader.split(" ")[1];
        const decodedValue = jwt.verify(token,process.env.JWT_SECERT as string) as JwtPayload

        if(!decodedValue || !decodedValue.user){
            res.status(401).json({
                message:"invalid token"
            })
            return
        }
        req.user = decodedValue.user;
        next();
    } catch (error) {
         res.status(401).json({
            message:"please login -jwt error"
        })
    }

}

export default isAuth;