import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions} from "langchain/agents";
import { SerpAPI, ChainTool } from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "langchain/llms/openai";
import * as fs from "fs";
import { Input } from "postcss";
<<<<<<< HEAD
import {Calculator} from "langchain/tools/calculator";
import { RetrievalQAChain ,loadQAStuffChain  } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
=======
>>>>>>> parent of 126d345 (Update index.js)
const path = require('path');

export default async function handler(req,res){
    const {prompt} = req.body;
    const filePathLaptop = path.join('C:', 'Users','Public', 'tevel-campers.txt');
    const generalInfo_FilePathDesktop = path.join('C:', 'Users', 'hai84', 'Desktop', "Projects", 'tevel-campers.txt');
    let shouldStartWriting = false;

    const model = new ChatOpenAI({
        modelName:"gpt-3.5-turbo",
        temperature:0.5,
        streaming:true,
        verbose:true,
        callbacks:[
            {
                handleLLMNewToken(token){
                    if (token === ' Input') {
                        shouldStartWriting = true;
                        token = 'תשובה עבור';               
                    }
                    if (shouldStartWriting) {
                        res.write(token);
                    } 
                }
            },
        ]
    });
    
    const text = fs.readFileSync(generalInfo_FilePathDesktop, 'utf8');
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    const dataChain = VectorDBQAChain.fromLLM(model,vectorStore);
      
    const prefix =`You are a helpful AI assistant for trip Caravan company called Tevel Campers. However
     Answer just in hebrew,
    every question asked you answer base on the tevel-campers-qa qaTool`;
        
    const qaTool = new ChainTool({
        name: "tevel-campers-qa",
        description:
          `אתה שימושי כאשר שואלים אותך על השכרת קרוואנים,מחירים,יעדים ,הצעות מחיר,מידע כללי על הקרוואן,תכנון מסלולים,פרטים ודרכי התקשרות,
        ..תמיד תשאל אם יש עוד שאלות ותהיה נחמד ואדיב ותענה רק בעברית`,
        chain: dataChain,
        returnDirect: true,
      });
      
    const tools = [
        // new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
        qaTool,
    ];

<<<<<<< HEAD
    //const retriever = vectorStore.asRetriever();

    const prefix =`Use the following pieces of context to answer the users question. If you don't know the answer, just say that you don't know, don't try to make up an answer`;

   // const chain = RetrievalQAChain.fromLLM(model,retriever,{descriptionTemplate});
    const tool = new ChainTool({
        name: "tevel-campers-information",
        description:`אתה שימושי כאשר שואלים אותך על השכרת קרוואנים,מחירים,יעדים ,הצעות מחיר,מידע כללי על הקרוואן,תכנון מסלולים,פרטים ויצירת קשר,
        ..תמיד תשאל אם יש עוד שאלות ותהיה נחמד ואדיב ותענה רק בעברית`,
        chain:dataChain,
        returnDirect:true,
      });
    
    // const tools = [
    //     // new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
    //     new Calculator(),
    //     qaTool,
    // ];

    const executer = await initializeAgentExecutorWithOptions(
        [tool],
        model,
        {
        agentType: "openai-functions",
        agentArgs:{
            prefix
=======
    const executer = await initializeAgentExecutorWithOptions(
        [qaTool],
        model,
        {
        agentType: "zero-shot-react-description",
        agentArgs:{
            prefix,
>>>>>>> parent of 126d345 (Update index.js)
        },
    }
    );
   
    console.log("Loaded the agent...");

    await executer.run(prompt);
<<<<<<< HEAD

    //await chain.call({query:prompt});
=======
>>>>>>> parent of 126d345 (Update index.js)

    res.end();
}