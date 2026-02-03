
from fastapi import FastAPI  # FastAPI is a modern, fast web framework for Python
from pydantic import BaseModel  # Pydantic is used for data validation and settings management
import spacy  # spaCy is a popular NLP library
import nltk # Natural Language Toolkit for text processing
from nltk.corpus import stopwords # For stopword removal
import string # For string manipulation
from sklearn.feature_extraction.text import TfidfVectorizer # For text vectorization
from sklearn.decomposition import LatentDirichletAllocation # For topic modeling
import numpy as np # For numerical operations
import time # For measuring processing time

# Create the FastAPI app instance
app = FastAPI()

# Load the small English spaCy model at startup (for NER and other NLP tasks)
nlp = spacy.load("en_core_web_sm")

# Ensure NLTK stopwords are downloaded: its important for text preprocessing
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Custom stopword list: financial terms
default_stopwords = set(stopwords.words('english'))
financial_terms = {
    'revenue', 'ebitda', 'asset', 'liability', 'fiscal', 'dividend', 'equity', 'debt', 'profit', 'loss',
    'cash', 'income', 'expense', 'balance', 'sheet', 'statement', 'earnings', 'interest', 'tax', 'amortization',
    'capital', 'investment', 'valuation', 'margin', 'turnover', 'ratio', 'liquidity', 'solvency', 'shareholder',
    'dividends', 'payable', 'receivable', 'inventory', 'goodwill', 'impairment', 'depreciation', 'operating',
    'noncurrent', 'current', 'assets', 'liabilities', 'net', 'gross', 'cost', 'sales', 'revenue', 'operating',
    'expenses', 'profitability', 'return', 'roi', 'roe', 'roa', 'ebit', 'ebitda', 'eps', 'diluted', 'basic',
    'shares', 'outstanding', 'capitalization', 'market', 'value', 'book', 'value', 'debt', 'equity', 'ratio',
    'leverage', 'coverage', 'dividend', 'yield', 'payout', 'growth', 'forecast', 'guidance', 'quarter', 'annual',
    'fiscal', 'year', 'period', 'q1', 'q2', 'q3', 'q4', 'yoy', 'qoq', 'cagr', 'guidance', 'projection', 'estimate'
}
custom_stopwords = default_stopwords - financial_terms

# Preprocessing function
def preprocess(text):
    tokens = [word.lower() for word in text.split()]
    tokens = [word.strip(string.punctuation) for word in tokens]
    tokens = [word for word in tokens if word and word not in custom_stopwords]
    return ' '.join(tokens)

# Health check endpoint: lets you verify the service is running
@app.get("/")
def read_root():
    return {"message": "The NER microservice is running :)"}

# Define the expected request body for the /ner endpoint
class TextRequest(BaseModel):
    text: str  # The text to analyze for named entities

# NER endpoint: receives text and returns detected entities
@app.post("/ner")
def extract_entities(request: TextRequest):
    doc = nlp(request.text)
    entities = [
        {
            "text": ent.text,
            "label": ent.label_,
            "start_char": ent.start_char,
            "end_char": ent.end_char
        }
        for ent in doc.ents
    ]
    return {"entities": entities, "input": request.text}


# --- New endpoint for full financial document analysis ---
@app.post("/analyze")
def analyze_document(request: TextRequest):
    start_time = time.time()
    text = request.text

    # 1. Preprocess text (retain financial terms)
    preprocessed_text = preprocess(text)

    # 2. NER extraction
    doc = nlp(text)
    entities = [
        {
            "text": ent.text,
            "label": ent.label_,
            "start_char": ent.start_char,
            "end_char": ent.end_char
        }
        for ent in doc.ents
    ]

    # Extract key financial figures (simple: all MONEY entities)
    key_figures = [ent["text"] for ent in entities if ent["label"] == "MONEY"]

    # 3. Topic modeling (TF-IDF + LDA)
    # For a single document, LDA is limited, but we can split into sentences for demo
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
    import re
    sentences = re.split(r'(?<=[.!?]) +', text)
    processed_sentences = [preprocess(s) for s in sentences if s.strip()]
    if len(processed_sentences) < 2:
        processed_sentences = [preprocessed_text, preprocessed_text]  # LDA needs >1 doc
    vectorizer = TfidfVectorizer(stop_words=list(custom_stopwords | ENGLISH_STOP_WORDS))
    X = vectorizer.fit_transform(processed_sentences)
    lda = LatentDirichletAllocation(n_components=2, random_state=42)
    lda.fit(X)
    topic_words = []
    for idx, topic in enumerate(lda.components_):
        top_indices = topic.argsort()[-5:][::-1]
        words = [vectorizer.get_feature_names_out()[i] for i in top_indices]
        topic_words.append({"topic": idx+1, "keywords": words})

    # 4. Simple extractive summary: sentences with most MONEY entities
    summary_sentences = []
    for sent in sentences:
        sent_doc = nlp(sent)
        if any(ent.label_ == "MONEY" for ent in sent_doc.ents):
            summary_sentences.append(sent)
    summary = " ".join(summary_sentences) if summary_sentences else sentences[0] if sentences else text

    end_time = time.time()
    processing_time = end_time - start_time

    return {
        "entities": entities,
        "key_figures": key_figures,
        "topics": topic_words,
        "summary": summary,
        "processing_time_seconds": round(processing_time, 3),
        "input": text
    }

# https://www.geeksforgeeks.org/python/testing-fastapi-application/