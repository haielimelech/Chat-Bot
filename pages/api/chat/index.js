import { ChatOpenAI } from "langchain/chat_models/openai";
import {HumanMessage} from "langchain/schema";
import { OpenAI } from "langchain/llms/openai";
import {SerpAPI} from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import {initializeAgentExecutorWithOptions} from "langchain/agents";
export default async function handler(req,res){
    const {prompt} = req.body;

    const model = new ChatOpenAI({
        modelName:"gpt-3.5-turbo",
        temperature:0.4,
        
    });
    const prefix ="You are a helpful AI assistant. However, But not all questions need to be searched on Google";

    const tools = [
        new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
        new Calculator(),
    ];
    
    const executer = await initializeAgentExecutorWithOptions(
        tools,
        model,
        {
        agentType: "openai-functions",
        agentArgs:{
            prefix,
        },
    });
    console.log("Loaded the agent...");
    
    const response = await executer.run(prompt);
    
     res.write(response);
     res.end();
}

    // let message ='';

    // const model = new ChatOpenAI({
    //     streaming:true,
    //     callbacks:[
    //         {
    //             handleLLMNewToken(token){
    //                 message+=token;
    //             },
    //         },
    //     ],
    // });
    
    // await model.call([ new HumanMessage(prompt)]);
    
    // res.write(message);
    // res.end();
