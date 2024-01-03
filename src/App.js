import React, { useState } from 'react';
import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";
import './App.css';

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [reply, setReply] = useState('');

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const privateKey = process.env.REACT_APP_SUPABASE_API_KEY;
  const url = process.env.REACT_APP_SUPABASE_URL;
  const supabase = createClient(url, privateKey);

  
  const handleInputChange = (e) => {
    e.preventDefault();
    setUserInput(e.target.value);
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await main(userInput);
    setUserInput('');
  }
  
  async function main(input) {
    try {
      setReply('Thinking...');
      const embedding = await createEmbedding(input);
      const match = await findNearestMatch(embedding);
      await getChatCompletion(match, input);
      
    } catch (error) {
      console.error("Error in main function", error.message);
      setReply("Sorry something went wrong. Please try again.")
    }
  }
  
  // Create an embedding vector representing the input text
  async function createEmbedding(input) {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input
    });
    return embeddingResponse.data[0].embedding;
  }
  
  // Query Supabase and return a semantically matching text chunk
  async function findNearestMatch(embedding) {
    const { data } = await supabase.rpc('match_movies', {
      query_embedding: embedding,
      match_threshold: 0.50,
      match_count: 4
    });
    // Manage multiple return matches
    const match = data.map(obj => obj.content).join('\n');
    return match;
  }
  
  // Use OpenAI to make the response conversational
  const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.` 
  }];

  async function getChatCompletion(text, query) {
    chatMessages.push({
      role: 'user',
      content: `Context: ${text} Question: ${query}`
    });
    
    const { choices } = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatMessages,
      temperature: 0.5,
      frequency_penalty: 0.5
    });

    const replyContent = choices[0].message.content;
    setReply(replyContent);
  }

  return (
    <div className="App">
      <h1>
            ReelRecs
            <span className="icon material-symbols-outlined">chat_bubble</span>
        </h1>
        <form onSubmit={handleSubmit}>
            <input
              type="text" 
              placeholder="How can I help?"
              value={userInput}
              onChange={handleInputChange}
            />
            <button type="submit">
                <span className="icon material-symbols-outlined">send</span>
            </button>
        </form>
        <p className="reply">{reply}</p>
    </div>
  );
};

export default App;