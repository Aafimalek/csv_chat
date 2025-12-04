import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def generate_code(columns: list[str], question: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")

    llm = ChatGroq(
        temperature=0,
        model="moonshotai/kimi-k2-instruct-0905",
        api_key=api_key
    )

    system_prompt = """You are an expert Python data analyst. 
    Your task is to generate Python code to analyze a dataset based on the user's question.
    The dataset is already loaded into a pandas DataFrame named `df`.
    
    The columns in the dataset are: {columns}
    
    Rules:
    1. You MUST use `df` as the dataframe variable.
    2. You MUST NOT load the csv file. It is already loaded.
    3. If the user asks for a plot, use `matplotlib.pyplot` as `plt`.
    4. Ensure the code is complete and executable.
    5. Do not include any markdown formatting (like ```python). Just return the raw code.
    6. Print the result for text answers.
    7. For plots, just call `plt.show()` at the end, do not save to file.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])

    chain = prompt | llm | StrOutputParser()

    response = chain.invoke({
        "columns": ", ".join(columns),
        "question": question
    })

    # Clean up markdown if present (just in case)
    cleaned_code = response.replace("```python", "").replace("```", "").strip()
    
    return cleaned_code
