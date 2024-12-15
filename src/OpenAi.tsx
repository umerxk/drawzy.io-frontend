import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await axios.post("http://127.0.0.1:3000/ask/", {
        content: userInput,
      });
      setResponse(res.data.message); // Assuming `res.data.message` contains the formatted response
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Ask AI</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="userInput"
              className="block text-sm font-medium text-gray-700"
            >
              Your Question
            </label>
            <input
              id="userInput"
              type="text"
              placeholder="Type your question here"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? "Loading..." : "Ask"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4">
            {error}
          </p>
        )}

        {response && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h2 className="text-xl font-semibold text-gray-800">AI Response:</h2>
            <div
              className="mt-2 text-gray-700"
              dangerouslySetInnerHTML={{ __html: response }} // Rendering HTML content
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
