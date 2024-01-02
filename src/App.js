import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import './App.css';

const App = () => {
  const [embedding, setEmbedding] = useState('');  
  
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing or invalid.");
  }

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const embed = async () => {
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: "Hello, World",
    })
    console.log(embeddings);
    return JSON.stringify(embeddings);
  }

  useEffect (() => {
    embed().then((embeddings) => {
      setEmbedding(embeddings);
    })
  })

  return (
    <div className="App">
      <p>{embedding}</p>
    </div>
  );
}

export default App;
