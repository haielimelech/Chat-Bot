import { ChatOpenAI } from "langchain/chat_models/openai";
import {HumanMessage} from "langchain/schema";

export default async function handler(req,res){
    const {prompt} = req.body;
    let message ='';

    const model = new ChatOpenAI({
        streaming:true,
        callbacks:[
            {
                handleLLMNewToken(token){
                    message+=token;
                },
            },
        ],
    });
    
    const response = await model.call([ new HumanMessage(prompt)]);
    
    res.write(message);
    res.end();

}