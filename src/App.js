import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";
import podcasts from './content';
import './App.css';

const App = () => {
  const [embedding, setEmbedding] = useState([]);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const privateKey = process.env.REACT_APP_SUPABASE_API_KEY;
  const url = process.env.REACT_APP_SUPABASE_URL;
  const supabase = createClient(url, privateKey);

  const query = "suggest a podcast for elon musk";
  
  async function main(input) {
    const embedding = await createEmbedding(input);
    const match = await findNearestMatch(embedding);
    await getChatCompletion(match, input);
  }
  
  async function createEmbedding(input) {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input
    });
    return embeddingResponse.data[0].embedding;
  }
  
  async function findNearestMatch(embedding) {
    const { data } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.50,
      match_count: 1
    });
    return data[0].content;
  }

  const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.` 
  }];

  async function getChatCompletion(text, query) {
    chatMessages.push({
      role: 'user',
      content: `Context: ${text} Question: ${query}`
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatMessages,
      temperature: 0.5,
      frequency_penalty: 0.5
    });
  
    console.log(response.choices[0].message.content);
    setEmbedding(response.choices[0].message.content);
  }

  useEffect(() => {
    let isMounted = true;  
      if (isMounted) {
        main(query);
      }
    return () => { isMounted = false };
  }, []);

  return (
    <div className="App">
      {embedding}
    </div>
  );
};

export default App;
