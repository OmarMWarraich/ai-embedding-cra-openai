import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import './App.css';

const App = () => {
  const [embedding, setEmbedding] = useState('');  
  
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

  const embed = async () => {
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    })
    console.log(embeddings.data);
    return JSON.stringify(embeddings.data);
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
