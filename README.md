# CSV Chat RAG 📊🤖

A powerful, privacy-focused application that allows you to chat with your CSV data using AI. Upload your datasets, ask questions in plain English, and get instant analysis and visualizations—all without your data ever leaving your browser.

![Project Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop)

## 🌟 Features

-   **🔒 Privacy First**: Your CSV data is processed entirely client-side using **Pyodide**. The actual dataset is **never** sent to the server.
-   **💬 Natural Language Interface**: Ask questions like "Show me the distribution of sales" or "Plot the correlation between age and salary".
-   **📈 Instant Visualizations**: Generates interactive matplotlib charts and graphs directly in the chat.
-   **⚡ Real-time Analysis**: Powered by Python running directly in your browser (WebAssembly).
-   **🤖 AI-Powered**: Uses advanced LLMs (via Groq/Moonshot) to translate your questions into Python code.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Python Runtime**: [Pyodide](https://pyodide.org/) (WebAssembly)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **AI/LLM**: [LangChain](https://www.langchain.com/) & [Groq](https://groq.com/)
-   **Validation**: [Pydantic](https://docs.pydantic.dev/)

## 🚀 How It Works

1.  **Upload**: You drop a CSV file. It's loaded into the browser's memory and Pyodide's virtual filesystem.
2.  **Schema Extraction**: The app reads the columns locally.
3.  **Question**: You ask a question. The app sends **only** the column names and your question to the backend.
4.  **Code Generation**: The AI generates Python code to answer your question.
5.  **Execution**: The code is sent back and executed by Pyodide in your browser against your local file.
6.  **Result**: You see the text answer or plot immediately.

## 🏁 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   A Groq or Moonshot AI API Key

### 1. Backend Setup

```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate it (Windows)
.\venv\Scripts\activate
# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-dotenv langchain-groq pydantic

# Create .env file
echo "MOONSHOT_API_KEY=your_api_key_here" > .env

# Run the server
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
