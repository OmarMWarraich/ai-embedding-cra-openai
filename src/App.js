import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from '@supabase/supabase-js';

const App = () => {
  const [embedding, setEmbedding] = useState([]);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  async function splitDocument(document){
    const response = await fetch(document);
    const text = await response.text();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 250,
      chunkOverlap: 35,
    });
    const output = await splitter.createDocuments([text]);
    return output;
  }

  async function createAndStoreEmbeddings(){
    const chunkData = await splitDocument("movies.txt");
    const data = await Promise.all(
      chunkData.map(async (chunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk.pageContent
        });
        return { 
          content: chunk.pageContent, 
          embedding: embeddingResponse.data[0].embedding 
        }
      })
    );
    await supabase.from('movies').insert(data);
    console.log(data);
    setEmbedding(data);
  };

  
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      createAndStoreEmbeddings();
    }
    
    return () => { isMounted = false };
  }, []);
  
  return (
    <div className="App">
      {
        embedding.map((chunk, index) => {
          return (
            <div key={index}>
              <h1>Chunk {index}</h1>
              <p>{chunk.content}</p>
              <p>{chunk.embedding}</p>
            </div>
          );
        })
      }
        
    </div>
  );
};

export default App;
