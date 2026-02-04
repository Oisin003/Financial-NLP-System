
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
# NOTE: Keep this list in sync with server/services/nlpProcessor.js

# Custom stopword list: financial terms to retain during preprocessing
# NOTE: Keep this list in sync with server/services/nlpProcessor.js
default_stopwords = set(stopwords.words('english'))
financial_terms = {
    # Income Statement Terms
    'revenue', 'revenues', 'sales', 'income', 'profit', 'loss', 'earnings', 'expense', 'expenses',
    'cost', 'costs', 'margin', 'ebitda', 'ebit', 'operating', 'nonoperating', 'gross', 'net',
    'pretax', 'aftertax', 'posttax', 'eps', 'diluted', 'basic', 'profitability',
    
    # Balance Sheet Terms
    'asset', 'assets', 'liability', 'liabilities', 'equity', 'capital', 'cash', 'inventory',
    'receivable', 'receivables', 'payable', 'payables', 'current', 'noncurrent', 'longterm',
    'shortterm', 'goodwill', 'intangible', 'tangible', 'property', 'plant', 'equipment', 'ppe',
    'retained', 'accumulated', 'shareholder', 'shareholders', 'stockholder', 'stockholders',
    
    # Cash Flow Terms
    'cashflow', 'financing', 'investing', 'operational', 'fcf', 'freecashflow', 'capex',
    'dividends', 'dividend', 'payout', 'buyback', 'repurchase',
    
    # Financial Ratios & Metrics
    'ratio', 'ratios', 'roi', 'roe', 'roa', 'roce', 'roic', 'liquidity', 'solvency', 'leverage',
    'coverage', 'turnover', 'yield', 'return', 'returns', 'valuation', 'multiple', 'pe', 'pb',
    'ps', 'ev', 'enterprise', 'wacc', 'capm', 'beta', 'alpha', 'volatility', 'sharpe',
    
    # Time Periods
    'fiscal', 'quarter', 'quarterly', 'annual', 'annually', 'year', 'period', 'ytd', 'mtd',
    'q1', 'q2', 'q3', 'q4', 'fy', 'yoy', 'qoq', 'mom', 'yoy', 'cagr',
    
    # Financial Instruments
    'stock', 'stocks', 'share', 'shares', 'bond', 'bonds', 'debt', 'loan', 'credit',
    'derivative', 'derivatives', 'option', 'options', 'future', 'futures', 'forward', 'forwards',
    'swap', 'swaps', 'hedge', 'hedging', 'warrant', 'warrants', 'convertible', 'preferred',
    'common', 'securities', 'portfolio', 'fund', 'etf', 'mutual', 'index',
    
    # Corporate Actions & Events
    'acquisition', 'merger', 'divestiture', 'spinoff', 'ipo', 'offering', 'issuance',
    'refinancing', 'restructuring', 'bankruptcy', 'liquidation', 'dissolution', 'dilution',
    'split', 'reverse', 'consolidation', 'consolidated', 'subsidiary', 'subsidiaries',
    'parent', 'affiliate', 'joint', 'venture', 'partnership',
    
    # Accounting & Reporting
    'balance', 'sheet', 'statement', 'report', 'disclosure', 'footnote', 'note', 'notes',
    'comprehensive', 'amortization', 'depreciation', 'impairment', 'writeoff', 'writedown',
    'provision', 'reserve', 'accrual', 'deferred', 'contingency', 'commitment', 'obligation',
    'restatement', 'adjustment', 'reclassification', 'fair', 'value', 'book', 'carrying',
    'market', 'historical', 'materiality', 'material',
    
    # Regulatory & Compliance
    'gaap', 'ifrs', 'us-gaap', 'ias', 'fasb', 'iasb', 'sec', 'sox', 'sarbanes-oxley',
    'compliance', 'regulation', 'regulatory', 'audit', 'auditor', 'audited', 'reviewed',
    'unaudited', 'opinion', 'qualified', 'unqualified', 'adverse', 'disclaimer',
    
    # SEC Filings
    '10-k', '10-q', '8-k', '10k', '10q', '8k', 'proxy', 'def14a', '20-f', '40-f', 's-1',
    'prospectus', 'registration', 'filing', 'exhibit', 'schedule',
    
    # Market & Trading
    'market', 'trading', 'price', 'pricing', 'exchange', 'traded', 'listed', 'delisted',
    'ticker', 'symbol', 'quotation', 'bid', 'ask', 'spread', 'volume', 'outstanding',
    'float', 'capitalization', 'marketcap', 'liquidity',
    
    # Risk & Treasury
    'risk', 'risks', 'exposure', 'hedge', 'hedging', 'counterparty', 'credit', 'default',
    'rating', 'ratings', 'agency', 'moodys', 'sp', 'fitch', 'benchmark', 'libor', 'sofr',
    'treasury', 'forex', 'fx', 'currency', 'currencies', 'foreign', 'translation', 'transaction',
    
    # Strategy & Planning
    'guidance', 'forecast', 'projection', 'estimate', 'estimates', 'outlook', 'target', 'goal',
    'budget', 'plan', 'strategy', 'strategic', 'initiative', 'growth', 'expansion', 'organic',
    'inorganic', 'synergy', 'synergies', 'efficiency', 'optimization',
    
    # Segments & Operations
    'segment', 'segments', 'geographic', 'geographical', 'regional', 'business', 'unit', 'division',
    'operations', 'operational', 'management', 'discussion', 'analysis', 'md&a', 'mda',
    'discontinued', 'continuing', 'core', 'noncore',
    
    # Tax
    'tax', 'taxes', 'taxation', 'taxable', 'deductible', 'dtl', 'dta', 'nol', 'carryforward',
    'carryback', 'effective', 'statutory', 'rate', 'jurisdiction', 'domestic', 'international',
    
    # Additional Common Terms
    'covenant', 'covenants', 'notional', 'nominal', 'contract', 'contractual', 'agreement',
    'arrangement', 'transaction', 'transactions', 'proceeds', 'disbursement', 'payment',
    'settlement', 'maturity', 'principal', 'interest', 'coupon', 'amortize', 'accrete',
    'appreciate', 'depreciate', 'recognize', 'recognition', 'measurement', 'remeasurement'
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

    # Extract key financial figures (all MONEY entities, labeled separately)
    financial_figures = [
        {
            "text": ent["text"],
            "start_char": ent["start_char"],
            "end_char": ent["end_char"]
        }
        for ent in entities if ent["label"] == "MONEY"
    ]

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
        "entities": [ent for ent in entities if ent["label"] != "MONEY"],
        "financial_figures": financial_figures,
        "topics": topic_words,
        "summary": summary,
        "processing_time_seconds": round(processing_time, 3),
        "input": text
    }

# https://www.geeksforgeeks.org/python/testing-fastapi-application/