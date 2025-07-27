import mongoose,{Document,Schema} from "mongoose";

export interface  IChat extends Document{
    users: string[];
    latestMessage:{
        text:string;
        sender:string;
    },
    createAt:Date;
    UpdatedAt:Date;
}

const schema:Schema<IChat> = new Schema({
    users:[{type:String,require:true}],
    latestMessage:{
        text: String,
        sender:String
    }
},{
    timestamps:true
})

export const Chat = mongoose.model<IChat>("Chat",schema);
