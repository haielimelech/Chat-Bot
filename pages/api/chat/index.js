import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI, ChainTool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { VectorDBQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

const path = require('path');


export default async function handler(req,res){
    const {prompt} = req.body;
    const filePathLaptop = path.join('C:', 'Users','Public', 'tevel-campers.txt');
    const filePathDesktop = path.join('C:', 'Users', 'hai84', 'Desktop', "Projects", 'tevel-campers.txt');
    const model = new ChatOpenAI({
        modelName:"gpt-3.5-turbo",
        temperature:0.4,
        streaming:true,
        verbose:true,
        callbacks:
        [
            {
                handleLLMNewToken(token){
                   res.write(token);
                }
            },
        ],
    });
    
    const text = fs.readFileSync(filePathLaptop, 'utf8');
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    const dataChain = VectorDBQAChain.fromLLM(new OpenAI(),vectorStore);
    
    const prefix ="You are a helpful AI assistant. However,Don't repeat yourself and every response suffix ask the user if he have any questions...";
    const qaTool = new ChainTool({
        name: "tevel-campers-qa",
        description:
          "שאלות ותשובות עבור חברת השכרות קרוואנים: אתה שימושי כאשר שואלים אותך על השכרת קרוואנים,מחירים,יעדים ,וכו.",
        chain: dataChain,
      });
    const tools = [
        new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
        new Calculator(),
        qaTool,
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
    
    await executer.run(prompt);
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
