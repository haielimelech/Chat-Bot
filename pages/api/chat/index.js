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
import { Input } from "postcss";

const path = require('path');

export default async function handler(req,res){
    const {prompt} = req.body;
    const filePathLaptop = path.join('C:', 'Users','Public', 'tevel-campers.txt');
    const generalInfo_FilePathDesktop = path.join('C:', 'Users', 'hai84', 'Desktop', "Projects", 'tevel-campers.txt');

  
    
    const model = new ChatOpenAI({
        modelName:"gpt-3.5-turbo",
        temperature:0.5,
        streaming:true,
        callbacks:
        [   
            {
                handleLLMNewToken(token){
                    res.write(token);
                }
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
    ,Be specific in your answers,
    ,every question asked you answer base on the (tevel-campers-qa),
    ,every response suffix ask the user if he have any questions...`;

    const qaTool = new ChainTool({
        name: "tevel-campers-qa",
        description:
          `אתה שימושי כאשר שואלים אותך על השכרת קרוואנים,מחירים,יעדים ,הצעות מחיר,מידע כללי על הקרוואן,תכנון מסלולים,פרטים ודרכי התקשרות,
            כל השאלות שתישאל לגבי טיולי קרוואנים תענה על בסיס המידע הזה בלבד כאשר התשובות הם קצרות ענייניות וספציפיות,
           תשאל תמיד האם יש שאלות נוספות...`,
        chain: dataChain,
        returnDirect: true,
      });
    const tools = [
        // new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
        qaTool,
       
    ];
    
    const executer = await initializeAgentExecutorWithOptions(
        [qaTool],
        model,
        {
        agentType: "zero-shot-react-description",
        maxIterations:3,
        agentArgs:{
            prefix,
        },
    }
    );
   
    console.log("Loaded the agent...");
    
    await executer.run(prompt);

    res.end();
}