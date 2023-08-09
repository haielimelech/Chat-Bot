import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import {createVectorStoreAgent} from "langchain/agents";
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
    const generalInfo_FilePathDesktop = path.join('C:', 'Users', 'hai84', 'Desktop', "Projects", 'tevel-campers.txt');
    let shouldStartWriting = 0;

    const model = new ChatOpenAI({
        modelName:"gpt-3.5-turbo",
        temperature:0,
        streaming:true,
        callbacks:
        [
            {
                handleLLMNewToken(token) {
                    res.write(token);
                },
            },
        ],
    });
    
    const text = fs.readFileSync(generalInfo_FilePathDesktop, 'utf8');
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    const dataChain = VectorDBQAChain.fromLLM(model,vectorStore);
    
    const prefix =`You are a helpful AI trip Caravan company called Tevel Campers assistant. However
    ,Answer just in hebrew,
    ,Be specific and Concise in your answers,
    ,every question asked you answer base on the מערכת מידע של תבל קמפרס tool but dont tell the user that you searching...,
    ,Any question you get asked exept that questions about a caravan trip(מערכת מידע של תבל קמפרס) ask the user if he could be more specific next time...
    ,every response suffix ask the user if he have any questions...`;

    const qaTool = new ChainTool({
        name: "שאלות ותשובות עבור חברת השכרות קרוואנים תבל קמפרס",
        description:
          `אתה שימושי כאשר שואלים אותך על השכרת קרוואנים,מחירים,יעדים,תפעול הקרוואן ,גיר,הצעות מחיר,תמיכה בעת תקלות,יצירת קשר,פניות ,תאונות,
           כל השאלות שתישאל לגבי טיולי קרוואנים תענה על בסיס המידע הזה,וכו.
           אם אתה לא יודע את התשובה תענה אם אפשר להיות יותר ספציפיים בשאלות הבאות.`,
        chain: dataChain,
        returnDirect: true,
      });
    const tools = [
        // new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
        // new Calculator(),
        qaTool,
    ];
    
    const executer = await initializeAgentExecutorWithOptions(
        tools,
        model,
        {
        agentType: "zero-shot-react-description",
        agentArgs:{
            prefix,
        },
    }
    );
   

    console.log("Loaded the agent...");
    
    await executer.run(prompt);
    res.end();
}