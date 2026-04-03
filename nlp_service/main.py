
from fastapi import FastAPI  # FastAPI is a modern, fast web framework for Python
from pydantic import BaseModel  # Pydantic is used for data validation and settings management
import spacy  # spaCy is a popular NLP library
import nltk # Natural Language Toolkit for text processing
from nltk.corpus import stopwords # For stopword removal
import string # For string manipulation
from sklearn.feature_extraction.text import TfidfVectorizer # For text vectorization
from sklearn.decomposition import LatentDirichletAllocation # For topic modeling
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np # For numerical operations
import time # For measuring processing time
import re

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
# This function cleans up text by:
# 1. Converting to lowercase
# 2. Removing punctuation
# 3. Removing stopwords (but keeping financial terms)
def preprocess(text):
    # Step 1: Split text into words and convert to lowercase
    words = text.split()
    lowercase_words = [word.lower() for word in words]
    
    # Step 2: Remove punctuation from each word
    words_without_punctuation = [word.strip(string.punctuation) for word in lowercase_words]
    
    # Step 3: Keep words that are not empty AND not in our stopwords list
    cleaned_words = []
    for word in words_without_punctuation:
        is_not_empty = word != ''
        is_not_stopword = word not in custom_stopwords
        if is_not_empty and is_not_stopword:
            cleaned_words.append(word)
    
    # Step 4: Join words back into a single string
    cleaned_text = ' '.join(cleaned_words)
    return cleaned_text

def split_sentences_with_offsets(text):
    # Keep sentence splitting conservative to avoid breaking financial rows
    candidates = re.split(r'(?<=[.!?])\s+|\n+', text)
    cleaned = []
    seen = set()
    cursor = 0

    for sentence in candidates:
        normalized = re.sub(r'\s+', ' ', sentence).strip()
        if len(normalized) < 25:
            continue

        signature = normalized.lower()
        if signature in seen:
            continue

        start_char = text.find(normalized, cursor)
        if start_char == -1:
            start_char = text.find(normalized)
        if start_char == -1:
            start_char = max(0, cursor)

        end_char = min(len(text), start_char + len(normalized))
        cursor = end_char

        seen.add(signature)
        cleaned.append({
            "id": len(cleaned),
            "text": normalized,
            "start_char": start_char,
            "end_char": end_char
        })

    return cleaned

def overlap_count(start_char, end_char, spans):
    count = 0
    for span in spans:
        span_start = span.get("start_char", -1)
        span_end = span.get("end_char", -1)
        if span_start < end_char and span_end > start_char:
            count += 1
    return count

def sentence_financial_weight(sentence, figure_hits=0, entity_hits=0):
    lower = sentence.lower()
    score = 1.0

    financial_keywords = [
        'turnover', 'revenue', 'sales', 'profit', 'loss', 'gross', 'operating', 'tax',
        'assets', 'liabilities', 'equity', 'cash', 'debt', 'borrowings', 'creditors',
        'debtors', 'income', 'expenses', 'interest', 'margin'
    ]

    keyword_hits = sum(1 for keyword in financial_keywords if keyword in lower)
    keyword_bonus = min(0.8, keyword_hits * 0.12) if keyword_hits > 0 else 0.0
    score += keyword_bonus

    contains_number = bool(re.search(r'£\s*\d|\d{1,3}(?:,\d{3})+', sentence))
    numeric_bonus = 0.35 if contains_number else 0.0
    score += numeric_bonus

    figure_bonus = min(0.6, figure_hits * 0.18)
    score += figure_bonus

    entity_bonus = min(0.4, entity_hits * 0.08)
    score += entity_bonus

    if len(sentence) > 420:
        score -= 0.15

    score = max(0.25, score)

    return score, {
        "keyword_hits": keyword_hits,
        "keyword_bonus": round(keyword_bonus, 4),
        "contains_number": contains_number,
        "numeric_bonus": round(numeric_bonus, 4),
        "figure_hits": figure_hits,
        "figure_bonus": round(figure_bonus, 4),
        "entity_hits": entity_hits,
        "entity_bonus": round(entity_bonus, 4)
    }

def tokenize_for_evaluation(text):
    if not text:
        return []
    return re.findall(r"[A-Za-z0-9£$€]+(?:[-'][A-Za-z0-9]+)?", text.lower())

def build_summary_evaluation_payload(summary_text, source_sentences, selected_sentence_ids):
    selected_sentences = [
        sentence["text"]
        for sentence in source_sentences
        if sentence["id"] in selected_sentence_ids
    ]

    return {
        "candidate_summary": summary_text,
        "candidate_sentences": selected_sentences,
        "candidate_tokens": tokenize_for_evaluation(summary_text),
        "source_sentence_count": len(source_sentences),
        "source_tokens": tokenize_for_evaluation(' '.join(sentence["text"] for sentence in source_sentences)),
        "selected_sentence_ids": selected_sentence_ids,
        "metrics_ready": {
            "rouge": ["rouge-1", "rouge-2", "rouge-l"],
            "bleu": ["bleu-1", "bleu-2", "bleu-3", "bleu-4"]
        },
        "reference_template": {
            "human_reference_summary": ""
        }
    }

def textrank_summary(text, entities=None, financial_figures=None, max_sentences=4):
    entities = entities or []
    financial_figures = financial_figures or []

    sentences = split_sentences_with_offsets(text)
    if len(sentences) == 0:
        fallback = text.strip()
        return {
            "summary": fallback,
            "selected_sentence_ids": [],
            "sentence_trace": [],
            "evaluation_payload": build_summary_evaluation_payload(fallback, [], [])
        }
    if len(sentences) <= max_sentences:
        selected_ids = [sentence["id"] for sentence in sentences]
        summary_text = ' '.join(sentence["text"] for sentence in sentences)
        sentence_trace = []
        for sentence in sentences:
            sentence_trace.append({
                "id": sentence["id"],
                "text": sentence["text"],
                "start_char": sentence["start_char"],
                "end_char": sentence["end_char"],
                "base_score": 1.0,
                "financial_weight": 1.0,
                "final_score": 1.0,
                "selected": True,
                "scoring_features": {
                    "keyword_hits": 0,
                    "keyword_bonus": 0.0,
                    "contains_number": bool(re.search(r'£\s*\d|\d{1,3}(?:,\d{3})+', sentence["text"])),
                    "numeric_bonus": 0.0,
                    "figure_hits": overlap_count(sentence["start_char"], sentence["end_char"], financial_figures),
                    "figure_bonus": 0.0,
                    "entity_hits": overlap_count(sentence["start_char"], sentence["end_char"], entities),
                    "entity_bonus": 0.0
                }
            })

        return {
            "summary": summary_text,
            "selected_sentence_ids": selected_ids,
            "sentence_trace": sentence_trace,
            "evaluation_payload": build_summary_evaluation_payload(summary_text, sentences, selected_ids)
        }

    sentence_texts = [sentence["text"] for sentence in sentences]

    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf = vectorizer.fit_transform(sentence_texts)

    sim_matrix = cosine_similarity(tfidf)
    sim_matrix = np.nan_to_num(sim_matrix, nan=0.0, posinf=0.0, neginf=0.0)
    np.fill_diagonal(sim_matrix, 0.0)

    # Normalize rows to make a stochastic matrix
    row_sums = sim_matrix.sum(axis=1, keepdims=True)
    safe_row_sums = np.where(row_sums <= 1e-12, 1.0, row_sums)
    transition = sim_matrix / safe_row_sums

    n = len(sentence_texts)
    zero_rows = (row_sums <= 1e-12).reshape(-1)
    if np.any(zero_rows):
        transition[zero_rows, :] = 1.0 / n

    scores = np.ones(n) / n
    damping = 0.85

    for _ in range(100):
        updated_scores = (1 - damping) / n + damping * transition.T.dot(scores)
        updated_scores = np.nan_to_num(updated_scores, nan=1.0 / n, posinf=1.0 / n, neginf=1.0 / n)
        if np.linalg.norm(updated_scores - scores, ord=1) < 1e-8:
            scores = updated_scores
            break
        scores = updated_scores

    sentence_trace = []
    weighted_scores = []
    for idx, sentence in enumerate(sentences):
        figure_hits = overlap_count(sentence["start_char"], sentence["end_char"], financial_figures)
        entity_hits = overlap_count(sentence["start_char"], sentence["end_char"], entities)
        financial_weight, scoring_features = sentence_financial_weight(
            sentence["text"],
            figure_hits=figure_hits,
            entity_hits=entity_hits
        )
        base_score = float(scores[idx])
        final_score = float(base_score * financial_weight)

        weighted_scores.append((idx, final_score))
        sentence_trace.append({
            "id": sentence["id"],
            "text": sentence["text"],
            "start_char": sentence["start_char"],
            "end_char": sentence["end_char"],
            "base_score": round(base_score, 6),
            "financial_weight": round(financial_weight, 6),
            "final_score": round(final_score, 6),
            "selected": False,
            "scoring_features": scoring_features
        })

    sorted_scores = sorted(weighted_scores, key=lambda item: item[1], reverse=True)
    selected_indices = [idx for idx, _ in sorted_scores[:max_sentences]]

    # Ensure at least one highly numeric sentence is selected when financial figures exist
    if financial_figures and not any(
        sentence_trace[idx]["scoring_features"]["figure_hits"] > 0
        for idx in selected_indices
    ):
        numeric_candidates = [
            idx for idx, trace in enumerate(sentence_trace)
            if trace["scoring_features"]["figure_hits"] > 0 or trace["scoring_features"]["contains_number"]
        ]
        if numeric_candidates:
            best_numeric_idx = max(
                numeric_candidates,
                key=lambda candidate_idx: sentence_trace[candidate_idx]["final_score"]
            )
            lowest_idx = min(selected_indices, key=lambda candidate_idx: sentence_trace[candidate_idx]["final_score"])
            if best_numeric_idx not in selected_indices:
                selected_indices.remove(lowest_idx)
                selected_indices.append(best_numeric_idx)

    selected_indices.sort()
    selected_ids = [sentences[idx]["id"] for idx in selected_indices]
    for idx in selected_indices:
        sentence_trace[idx]["selected"] = True

    summary_text = ' '.join(sentence_texts[idx] for idx in selected_indices)

    return {
        "summary": summary_text,
        "selected_sentence_ids": selected_ids,
        "sentence_trace": sentence_trace,
        "evaluation_payload": build_summary_evaluation_payload(summary_text, sentences, selected_ids)
    }

def build_decision_trace(summary_result, entities, financial_figures, topic_words):
    topic_trace = []
    for topic in topic_words:
        topic_trace.append({
            "topic": topic.get("topic"),
            "rule": "Top-5 terms from LDA component weights",
            "keywords": topic.get("keywords", [])
        })

    return {
        "summary": {
            "method": "textrank_extractive_v2",
            "rule": "Sentence graph ranking + financial/entity weighting + numeric coverage safeguard",
            "selected_sentence_ids": summary_result.get("selected_sentence_ids", []),
            "sentence_decisions": summary_result.get("sentence_trace", [])
        },
        "entity_and_rule_provenance": {
            "entities_used_count": len(entities),
            "financial_figures_used_count": len(financial_figures),
            "entity_examples": entities[:20],
            "financial_figure_examples": financial_figures[:20],
            "figure_extraction_rule": "Regex amount match + nearby financial keyword context + de-duplication"
        },
        "topics": {
            "method": "LDA",
            "rule": "Top weighted tokens per topic component",
            "topic_decisions": topic_trace
        }
    }

def extract_financial_figures(text, limit=40):
    amount_pattern = re.compile(r'(?<!\w)(?:£\s*)?\(?-?\d{1,3}(?:,\d{3})+(?:\.\d+)?\)?(?!\w)|(?<!\w)(?:£\s*)?\(?-?\d{4,}(?:\.\d+)?\)?(?!\w)')
    financial_keywords = [
        'turnover', 'revenue', 'sales', 'profit', 'loss', 'gross', 'operating', 'tax',
        'assets', 'liabilities', 'equity', 'cash', 'debt', 'borrowings', 'creditors',
        'debtors', 'income', 'expenses', 'interest', 'margin', 'shareholders', 'funds'
    ]

    figures = []
    seen_values = set()

    for match in amount_pattern.finditer(text):
        raw_value = match.group().strip()
        normalized_value = raw_value.replace(' ', '')

        numeric = re.sub(r'[£,()\s]', '', raw_value)
        if numeric.startswith('-'):
            numeric_abs = numeric[1:]
        else:
            numeric_abs = numeric

        try:
            num_val = float(numeric_abs)
        except ValueError:
            continue

        has_currency = '£' in raw_value
        has_comma = ',' in raw_value
        if not has_currency and not has_comma and 1900 <= num_val <= 2100:
            continue

        context_start = max(0, match.start() - 80)
        context_end = min(len(text), match.end() + 80)
        context = text[context_start:context_end]
        context_lower = context.lower()

        if not any(keyword in context_lower for keyword in financial_keywords):
            continue

        if normalized_value in seen_values:
            continue

        seen_values.add(normalized_value)
        figures.append({
            "text": raw_value,
            "start_char": match.start(),
            "end_char": match.end(),
            "context": re.sub(r'\s+', ' ', context).strip()
        })

        if len(figures) >= limit:
            break

    return figures

def extract_entities_from_text(text):
    # Run spaCy once and convert entities to plain dictionaries
    processed_document = nlp(text)

    entities = []
    for entity in processed_document.ents:
        entities.append({
            "text": entity.text,
            "label": entity.label_,
            "start_char": entity.start_char,
            "end_char": entity.end_char
        })

    return entities

def build_topics_from_text(original_text, cleaned_text):
    # Import here so the top of the file stays focused on core dependencies
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

    # Split into candidate sentences for topic modeling
    candidate_sentences = re.split(r'(?<=[.!?]) +', original_text)

    processed_sentences = []
    for sentence in candidate_sentences:
        if sentence.strip():
            processed_sentence = preprocess(sentence)
            processed_sentences.append(processed_sentence)

    # LDA needs at least two documents
    if len(processed_sentences) < 2:
        processed_sentences = [cleaned_text, cleaned_text]

    all_stopwords = list(custom_stopwords | ENGLISH_STOP_WORDS)
    vectorizer = TfidfVectorizer(stop_words=all_stopwords)
    tfidf_matrix = vectorizer.fit_transform(processed_sentences)

    lda_model = LatentDirichletAllocation(n_components=2, random_state=42)
    lda_model.fit(tfidf_matrix)

    topic_words = []
    feature_names = vectorizer.get_feature_names_out()
    for topic_number, topic_weights in enumerate(lda_model.components_):
        top_word_indices = topic_weights.argsort()[-5:][::-1]
        top_keywords = [feature_names[index] for index in top_word_indices]
        topic_words.append({
            "topic": topic_number + 1,
            "keywords": top_keywords
        })

    return topic_words

# Health check endpoint: lets you verify the service is running
@app.get("/")
def read_root():
    return {"message": "The NER microservice is running :)"}

# Define the expected request body for the /ner endpoint
class TextRequest(BaseModel):
    text: str  # The text to analyze for named entities

# NER endpoint: receives text and returns detected entities
# NER = Named Entity Recognition (finding names, places, money amounts, etc.)
@app.post("/ner")
def extract_entities(request: TextRequest):
    found_entities = extract_entities_from_text(request.text)

    return {"entities": found_entities, "input": request.text}


# --- Full Financial Document Analysis Endpoint ---
# This endpoint performs complete NLP analysis on financial documents
@app.post("/analyze")
def analyze_document(request: TextRequest):
    # Record start time to measure how long processing takes
    start_time = time.time()
    original_text = request.text

    # ========== STEP 1: Preprocess the text ==========
    # Clean up the text by removing stopwords but keeping financial terms
    cleaned_text = preprocess(original_text)

    # ========== STEP 2: Extract Named Entities (NER) ==========
    all_entities = extract_entities_from_text(original_text)

    # ========== STEP 3: Extract Financial Figures ==========
    # Use regex + nearby financial context for cleaner, more reliable values
    financial_figures = extract_financial_figures(original_text)

    # Keep non-money entities for entity panels (financial figures are already separate)
    non_money_entities = [entity for entity in all_entities if entity["label"] != "MONEY"]

    # ========== STEP 4: Topic Modeling (LDA) ==========
    topic_words = build_topics_from_text(original_text, cleaned_text)

    # ========== STEP 5: Create Summary ==========
    summary_result = textrank_summary(
        original_text,
        entities=non_money_entities,
        financial_figures=financial_figures,
        max_sentences=4
    )
    summary = summary_result["summary"]
    summary_evaluation = summary_result["evaluation_payload"]

    # ========== STEP 5 The Sequal :) Build Explainability Trace ==========
    decision_trace = build_decision_trace(
        summary_result=summary_result,
        entities=non_money_entities,
        financial_figures=financial_figures,
        topic_words=topic_words
    )

    # ========== STEP 6: Calculate Processing Time ==========
    end_time = time.time()
    processing_time = end_time - start_time

    # ========== Return Results ==========
    return {
        "entities": non_money_entities,
        "financial_figures": financial_figures,
        "topics": topic_words,
        "summary": summary,
        "summary_evaluation": summary_evaluation,
        "decision_trace": decision_trace,
        "processing_time_seconds": round(processing_time, 3),
        "input": original_text
    }

# https://www.geeksforgeeks.org/python/testing-fastapi-application/