import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";
import podcasts from './content';
import './App.css';

const App = () => {
  const [embedding, setEmbedding] = useState([]);

  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing or invalid.");
  }

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const privateKey = process.env.REACT_APP_SUPABASE_API_KEY;
  if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
  const url = process.env.REACT_APP_SUPABASE_URL;
  if (!url) throw new Error(`Expected env var SUPABASE_URL`);
  const supabase = createClient(url, privateKey);

  useEffect(() => {
  
    let isMounted = true;
  
    async function main(input) {
      console.log('Main function is running');
      const data = await Promise.all(
        input.map(async (textChunk) => {
          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: textChunk,
          });
          return {
            content: textChunk,
            embedding: embeddingResponse.data[0].embedding,
          };
        })
      );
  
      await supabase.from('documents').insert(data);
    }
  
    if (isMounted) {
      main(podcasts);
    }
  
    return () => {
      isMounted = false;
    };
  }, []);
  

  return (
    <div className="App">
      {/* {embedding.map((item, index) => (
        <p key={index}>{`Content: ${item.content}, Embedding: ${item.embedding}`}</p>
      ))} */}
    </div>
  );
};

export default App;
