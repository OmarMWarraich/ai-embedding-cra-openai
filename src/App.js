import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import './App.css';

const App = () => {
  const [embedding, setEmbedding] = useState([]);
  
  const content = [
    "Beyond Mars: speculating life on distant planets.",
    "Jazz under stars: a night in New Orleans' music scene.",
    "Mysteries of the deep: exploring uncharted ocean caves.",
    "Rediscovering lost melodies: the rebirth of vinyl culture.",
    "Tales from the tech frontier: decoding AI ethics.",
  ]; 

  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing or invalid.");
  }

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const embed = async (input) => {
    const embeddingResponse = await Promise.all(input.map(async (textChunk) => {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: textChunk,
      });
      return { content: textChunk, embedding: response.data[0].embedding };
    }));
    console.log(embeddingResponse);
    return embeddingResponse;
  }

  useEffect(() => {
    embed(content).then((embeddingResponse) => {
      setEmbedding(embeddingResponse);
    });
  }, []);

  return (
    <div className="App">
      {embedding.map((item, index) => (
        <p key={index}>{`Content: ${item.content}, Embedding: ${item.embedding}`}</p>
      ))}
    </div>
  );
}

export default App;
