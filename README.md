# QueryCSV 📊🤖

**Chat with your data — privately, securely, and locally.**

QueryCSV is a modern, privacy-first web application that enables users to perform complex data analysis on CSV files using natural language. Unlike traditional tools, QueryCSV executes all data processing **locally in your browser** using WebAssembly (Pyodide), ensuring your sensitive datasets never leave your device. The backend uses advanced LLMs solely to translate your questions into executable Python code.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## 🌟 Key Features

### 🔒 Privacy-First Architecture
Your CSV data is loaded into the browser's memory and processed **entirely on the client-side**. Only the column names (schema) are sent to the AI for context — **never your actual data rows**.

### ⚡ Client-Side Python Execution
Powered by **Pyodide** (Python compiled to WebAssembly), enabling real-time data manipulation and analysis directly in your browser without server latency. Supports:
- **pandas** — Data manipulation and analysis
- **matplotlib** — Static visualizations
- **seaborn** — Statistical data visualization
- **scikit-learn** — Machine learning algorithms

### 💾 Persistent Sessions
- **IndexedDB**: Automatically saves your uploaded CSV files to your browser's secure database. Refresh the page without losing your data.
- **LocalStorage**: Persists your chat history and sessions. Switch between multiple analyses seamlessly and resume where you left off.

### 🤖 AI-Driven Code Generation
Uses **LangChain** and **Groq** (with the `moonshotai/kimi-k2-instruct-0905` model) to understand your natural language questions and generate accurate, executable Python code.

### 📈 Rich Visualizations
Generate and render charts directly in the chat interface:
- Bar charts, line plots, scatter plots
- Pairplots, heatmaps, distribution plots
- Any matplotlib/seaborn visualization

### 🎨 Neobrutalist UI Design
A distinctive design featuring:
- Sharp corners with no border radius
- Bold black/white borders with offset shadows
- Bright yellow accent color (`hsl(48, 100%, 50%)`)
- Dark mode support with system preference detection
- **Space Grotesk** typography
- Smooth Framer Motion animations

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.0.7 | React framework with App Router |
| [React](https://react.dev/) | 19.2.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [Shadcn UI](https://ui.shadcn.com/) | New York | Component library (Radix Primitives) |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Animations and transitions |
| [Pyodide](https://pyodide.org/) | 0.23.4 | Python runtime in WebAssembly |
| [Lucide React](https://lucide.dev/) | 0.555.0 | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Dark mode support |
| [uuid](https://github.com/uuidjs/uuid) | 13.x | Session ID generation |

### Backend

| Technology | Purpose |
|------------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | High-performance Python web framework |
| [LangChain](https://www.langchain.com/) | AI orchestration and prompt management |
| [Groq](https://groq.com/) | LLM inference provider |
| [Pydantic](https://docs.pydantic.dev/) | Data validation |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server |
| [python-dotenv](https://github.com/theskumar/python-dotenv) | Environment variable management |

### LLM Model
- **Provider**: Groq
- **Model**: `moonshotai/kimi-k2-instruct-0905`
- **Temperature**: 0 (deterministic outputs)

---

## 🔄 Architecture & Data Flow

```
+------------------------------------------------------------------+
|                         USER BROWSER                              |
+------------------------------------------------------------------+
|                                                                   |
|  +----------------+   +----------------+   +------------------+   |
|  |    Upload      |-->|   IndexedDB    |   |   LocalStorage   |   |
|  |    CSV File    |   |    (Files)     |   |    (Sessions)    |   |
|  +----------------+   +----------------+   +------------------+   |
|          |                                                        |
|          v                                                        |
|  +----------------------------------------------------------------+
|  |                   PYODIDE (WebAssembly)                        |
|  |  +----------+ +------------+ +-----------+ +------------+      |
|  |  |  pandas  | | matplotlib | |  seaborn  | |  sklearn   |      |
|  |  +----------+ +------------+ +-----------+ +------------+      |
|  |                                                                |
|  |  Virtual Filesystem: /home/pyodide/filename.csv                |
|  +----------------------------------------------------------------+
|          |                                                        |
|          | Column names only (NOT the data)                       |
|          v                                                        |
+------------------------------------------------------------------+
                               |
                               |  POST /generate
                               |  { columns: [...], question: "..." }
                               v
+------------------------------------------------------------------+
|                       FASTAPI BACKEND                             |
+------------------------------------------------------------------+
|                                                                   |
|  +----------------+   +----------------+   +------------------+   |
|  |    Receive     |-->|   LangChain    |-->|    Groq API      |   |
|  |    Request     |   |    Prompt      |   |    (Kimi K2)     |   |
|  +----------------+   +----------------+   +------------------+   |
|                                                   |               |
|                                                   v               |
|                            +------------------------------+       |
|                            |   Generated Python Code      |       |
|                            |   (pandas, matplotlib, etc.) |       |
|                            +------------------------------+       |
|                                                                   |
+------------------------------------------------------------------+
                               |
                               |  { code: "import pandas as pd..." }
                               v
+------------------------------------------------------------------+
|                         USER BROWSER                              |
+------------------------------------------------------------------+
|                                                                   |
|  +----------------------------------------------------------------+
|  |  Execute code in Pyodide against local CSV data                |
|  |  Capture stdout and matplotlib figures as Base64               |
|  +----------------------------------------------------------------+
|          |                                                        |
|          v                                                        |
|  +----------------------------------------------------------------+
|  |  Render results: Text output + Inline chart images             |
|  +----------------------------------------------------------------+
|                                                                   |
+------------------------------------------------------------------+
```

### Step-by-Step Flow

1. **Upload**: User drops a CSV file. It is saved to **IndexedDB** for persistence and loaded into Pyodide's virtual filesystem (`/home/pyodide/filename.csv`).

2. **Schema Extraction**: Pyodide reads the file locally to extract column names using pandas.

3. **Question**: User asks a natural language question (e.g., "Show me the distribution of prices").

4. **API Request**: The frontend sends only the **question** and **column names** to the FastAPI backend — **not the actual data**.

5. **Code Generation**: The backend uses LangChain to construct a prompt and sends it to Groq. The LLM generates executable Python code.

6. **Execution**: The generated code is returned to the browser and executed by Pyodide against the local CSV data.

7. **Rendering**: 
   - Text output (stdout) is displayed in the chat
   - Matplotlib plots are captured as Base64 PNG images and rendered inline
   - Generated code is available in a collapsible section

8. **Recovery**: If the page is refreshed, the app automatically retrieves the file from IndexedDB, restores the Pyodide session, and reloads the chat history from LocalStorage.

---

## 📁 Project Structure

```
csv_chat/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── chain.py             # LangChain prompt and code generation logic
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Pyodide script loading
│   │   ├── page.tsx         # Main application page
│   │   ├── globals.css      # Tailwind CSS with neobrutalist theme
│   │   └── icon.tsx         # Dynamic favicon
│   │
│   ├── components/
│   │   ├── ChatInterface.tsx   # Chat UI with message handling
│   │   ├── FileUpload.tsx      # Drag-and-drop file upload
│   │   ├── Sidebar.tsx         # Session management sidebar
│   │   ├── ResultDisplay.tsx   # Output and plot rendering
│   │   ├── mode-toggle.tsx     # Dark/light mode switcher
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   └── ui/                 # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       ├── sheet.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   └── usePyodide.ts    # Custom hook for Pyodide initialization
│   │
│   ├── lib/
│   │   ├── db.ts            # IndexedDB operations for file persistence
│   │   └── utils.ts         # Utility functions (cn for classnames)
│   │
│   ├── package.json         # Node.js dependencies
│   ├── next.config.ts       # Next.js configuration with API rewrites
│   ├── components.json      # Shadcn UI configuration
│   └── tsconfig.json        # TypeScript configuration
│
├── render.yaml              # Render.com deployment configuration
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Python** v3.10 or higher
- A **[Groq API Key](https://console.groq.com/)** (free tier available)

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

# Activate virtual environment
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# Windows (CMD)
.\venv\Scripts\activate.bat
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file with your Groq API key
echo GROQ_API_KEY=your_actual_api_key_here > .env

# Start the development server
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/generate` | Generate Python code from question |

### 3. Frontend Setup

Open a **new terminal** window:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key for LLM access | ✅ Yes |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

---

## 🌐 Deployment

### Render.com

The project includes a `render.yaml` for easy deployment to Render:

```yaml
services:
  - type: web
    name: csv-chat-backend
    env: python
    region: singapore
    plan: free
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port 10000
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.9
      - key: GROQ_API_KEY
        sync: false

  - type: web
    name: csv-chat-frontend
    env: node
    region: singapore
    plan: free
    rootDir: frontend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        fromService:
          type: web
          name: csv-chat-backend
          envVarKey: RENDER_EXTERNAL_URL
```

**To deploy:**
1. Push your code to GitHub
2. Connect your repository to Render
3. Import the `render.yaml` blueprint
4. Add your `GROQ_API_KEY` in the Render dashboard

---

## 🎯 Usage Examples

Once your CSV is uploaded, try these prompts:

| Question | What it does |
|----------|--------------|
| "Show me the first 5 rows" | Displays head of the dataframe |
| "What are the column types?" | Shows dtypes for each column |
| "Calculate the average of Price" | Computes mean of a numeric column |
| "Create a bar chart of Category counts" | Generates a bar plot |
| "Show the correlation heatmap" | Creates a seaborn heatmap |
| "Create a pairplot of Price vs Stock" | Generates a scatter matrix |
| "Find rows where Price > 100" | Filters the dataframe |
| "Group by Category and sum the Sales" | Performs groupby aggregation |
| "Train a linear regression to predict Price" | Uses scikit-learn for ML |

---

## 🔐 Security & Privacy

| Aspect | Implementation |
|--------|----------------|
| **Data stays local** | CSV data is never sent to the server |
| **Schema only** | Only column names are sent for context |
| **No persistent storage** | Backend is stateless, stores nothing |
| **IndexedDB** | Files stored in browser's secure storage |
| **CORS enabled** | Configured for development flexibility |

---

## 📦 Python Packages in Pyodide

The following packages are pre-loaded when Pyodide initializes:

| Package | Version | Purpose |
|---------|---------|---------|
| pandas | (Pyodide bundled) | Data manipulation |
| matplotlib | (Pyodide bundled) | Plotting |
| seaborn | (via micropip) | Statistical visualization |
| scikit-learn | (Pyodide bundled) | Machine learning |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the **MIT License**.

---

## 👤 Author

**Aafi Malek**

- GitHub: [@Aafimalek](https://github.com/Aafimalek)

---

## 🙏 Acknowledgments

- [Pyodide](https://pyodide.org/) for making Python in the browser possible
- [Groq](https://groq.com/) for lightning-fast LLM inference
- [Shadcn UI](https://ui.shadcn.com/) for beautiful, accessible components
- [Vercel](https://vercel.com/) for the Next.js framework
