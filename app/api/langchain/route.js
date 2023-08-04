import { ChatOpenAI } from "langchain/chat_models/openai";
import {HumanMessage} from "langchain/schema";

const runLLMChain = async (prompt) => {
    const encoder = new TextEncoder();


    const stream  = new TransformStream();
    const writer = stream.writable.getWriter();
    const model = new ChatOpenAI({
        streaming:true,
        callbacks:[
            {
             async handleLLMNewToken(token){
                    await writer.ready
                    await writer.write(encoder.encode(`${token}`))
                },
                async handleLLMEnd(){
                    await writer.ready;
                    await writer.closed();
                }
            },
        ],
    });
    
    model.call([ new HumanMessage(prompt)]);

    return stream.readable;
}

export async function POST(req){
    const {prompt} = await req.json();

    const stream = runLLMChain(prompt);
    return new Response(await stream);
}