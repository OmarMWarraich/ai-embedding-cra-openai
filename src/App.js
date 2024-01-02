import React, { useState, useEffect } from 'react';
import { CharacterTextSplitter } from "langchain/text_splitter"
import './App.css';

const App = () => {
  const [embedding, setEmbedding] = useState([]);

  async function splitDocument() {
    const response = await fetch('podcasts.txt');
    const text = await response.text();
  
    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 150,
      chunkOverlap: 15,
    });
    const output = await splitter.createDocuments([text]);
    console.log(output);
    setEmbedding(output);
  }

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      splitDocument();
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
              <p>{chunk.pageContent}</p>
            </div>
          );
        })
      }
        
    </div>
  );
};

export default App;
