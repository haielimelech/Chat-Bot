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
    const generalInfo_FilePathDesktop = process.env.GENERAL_INFO_FILE_PATH;

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