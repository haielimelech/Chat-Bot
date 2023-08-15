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
import {Calculator} from "langchain/tools/calculator";
import { RetrievalQAChain ,loadQAStuffChain  } from "langchain/chains";

const path = require('path');

export default async function handler(req,res){
    const {prompt} = req.body;

    const filePathLaptop = path.join('C:', 'Users','Public', 'tevel-campers.txt');
    const generalInfo_FilePathDesktop = path.join('C:', 'Users', 'hai84', 'Desktop', "Projects", 'tevel-campers.txt');
    //let shouldStartWriting = false;

    const model = new ChatOpenAI({
        modelName:"gpt-3.5-turbo",
        temperature:0.3,
        streaming:true,
        callbacks:[
            {
                handleLLMNewToken(token){
                    res.write(token);
                }
            },
        ]
    });
    
    const text = fs.readFileSync(generalInfo_FilePathDesktop, 'utf8');
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000,chunkOverlap:200});
    const docs = await textSplitter.createDocuments([text]);
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    //const dataChain = VectorDBQAChain.fromLLM(model,vectorStore);

    const prefix =`You are a helpful AI assistant for trip Caravan company called Tevel Campers. However
    Answer just in hebrew, and always ask if there any more question every time you finish answering a question`;

    const retriever = vectorStore.asRetriever();

    const chain = RetrievalQAChain.fromLLM(model,retriever,{
        agentType:"zero-shot-react-description",
        agentArgs:{
            prefix
        }
    });

    console.log("Loaded the Chain...");

    await chain.run(prompt);

    res.end();
}

// const qaTool = new ChainTool({
    //     name: "tevel-campers-qa",
    //     description:`שאתה שימושי כאשר שואלים אותך על השכרת קרוואנים,מחירים,יעדים ,הצעות מחיר,מידע כללי על הקרוואן,תכנון מסלולים,פרטים ודרכי התקשרות,Always answer in hebrew, Ask if there any more question every time you finish answering a question`,
    //     chain: dataChain,
    //     returnDirect: true,
    //   });

    // const tools = [
    //     // new SerpAPI(process.env.SERPAPI_API_KEY,{hl: "en",gl: "us"}),
    //     new Calculator(),
    //     qaTool,
    // ];

    // const executer = await initializeAgentExecutorWithOptions([qaTool],new OpenAI({modelName:"gpt-3.5-turbo"}),{
    //     agentType:"zero-shot-react-description",
    //     agentArgs:{
    //         prefix
    // }}
    // );
   
    // console.log("Loaded the agent...");

    // await executer.run(prompt);