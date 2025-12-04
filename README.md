# QueryCSV 📊🤖

**Chat with your data, privately and securely.**

QueryCSV is a modern, privacy-focused web application that enables users to perform complex data analysis on CSV files using natural language. Unlike traditional tools, QueryCSV executes all data processing **locally in your browser** using WebAssembly (Pyodide), ensuring your sensitive datasets never leave your device. The backend uses advanced LLMs solely to translate your questions into executable Python code.

![Project Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop)

## 🌟 Key Features

*   **🔒 Privacy-First Architecture**: Your CSV data is loaded into the browser's memory and processed locally. Only the *schema* (column names) is sent to the AI, not the rows.
*   **⚡ Client-Side Execution**: Powered by **Pyodide** (Python compiled to WebAssembly), allowing for real-time data manipulation and analysis without server latency.
*   **💾 Persistent Sessions**:
    *   **IndexedDB**: Automatically saves your uploaded files to your browser's secure database, so you can refresh the page without losing your data.
    *   **LocalStorage**: Persists your chat history and sessions, allowing you to switch between multiple analyses seamlessly.
*   **🤖 AI-Driven Analysis**: Uses **LangChain** and **Groq** (specifically the `moonshotai/kimi-k2-instruct-0905` model) to understand your questions and generate accurate Pandas/Matplotlib/Seaborn code.
*   **📈 Advanced Visualizations**: Instantly generate and render charts (bar, line, scatter, pairplots, heatmaps) directly in the chat interface using `matplotlib` and `seaborn`.
*   **🎨 Modern Neobrutalist UI**: Built with **Next.js 16**, **Tailwind CSS v4**, and **Framer Motion**, featuring a distinct "sharp" aesthetic, dark mode support, and smooth animations.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
*   **Python Runtime**: [Pyodide](https://pyodide.org/) (v0.23.4)
*   **Persistence**: IndexedDB (via native API) & LocalStorage
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **AI Orchestration**: [LangChain](https://www.langchain.com/)
*   **LLM Provider**: [Groq](https://groq.com/)
*   **Model**: `moonshotai/kimi-k2-instruct-0905`
*   **Server**: Uvicorn

## 🚀 Logic Flow

1.  **Upload**: User drops a CSV file. It is saved to **IndexedDB** for persistence and loaded into Pyodide's virtual filesystem (`/home/pyodide/filename.csv`).
2.  **Schema Extraction**: Pyodide reads the file locally to extract column names.
3.  **Question**: User asks a question (e.g., "Create a pairplot of Price vs Stock").
4.  **Prompting**: The frontend sends the *question* and *column names* (NOT the data) to the FastAPI backend.
5.  **Code Generation**: The backend uses Groq to generate a Python script that uses `pandas`, `matplotlib`, `seaborn`, and `scikit-learn`.
6.  **Execution**: The generated code is returned to the frontend and executed by Pyodide against the local CSV file.
7.  **Rendering**: Text output is displayed, and plots are captured as Base64 strings and rendered as images.
8.  **Recovery**: If the page is refreshed, the app automatically retrieves the file from IndexedDB and restores the Pyodide session.

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   A [Groq API Key](https://console.groq.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Aafimalek/csv_chat
cd csv_chat
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment
# Create a .env file and add your Groq API key
echo "GROQ_API_KEY=your_actual_api_key_here" > .env

# Run the server
uvicorn main:app --reload
```
*The backend will run on `http://localhost:8000`*

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The frontend will run on `http://localhost:3000`*

## 📄 License

This project is open source and available under the MIT License.
