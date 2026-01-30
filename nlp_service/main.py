
from fastapi import FastAPI  # FastAPI is a modern, fast web framework for Python
from pydantic import BaseModel  # Pydantic is used for data validation and settings management
import spacy  # spaCy is a popular NLP library

# Create the FastAPI app instance
app = FastAPI()

# Load the small English spaCy model at startup (for NER and other NLP tasks)
nlp = spacy.load("en_core_web_sm")

# Health check endpoint: lets you verify the service is running
@app.get("/")
def read_root():
    return {"message": "NER microservice is running!"}

# Define the expected request body for the /ner endpoint
class TextRequest(BaseModel):
    text: str  # The text to analyze for named entities

# NER endpoint: receives text and returns detected entities
@app.post("/ner")
def extract_entities(request: TextRequest):
    # Process the input text with spaCy to extract entities
    doc = nlp(request.text)
    entities = [
        {
            "text": ent.text,           # The entity string
            "label": ent.label_,        # The entity type (e.g., PERSON, ORG, DATE)
            "start_char": ent.start_char,  # Start position in the text
            "end_char": ent.end_char       # End position in the text
        }
        for ent in doc.ents
    ]
    # Return the list of entities and the original input
    return {"entities": entities, "input": request.text}

# https://www.geeksforgeeks.org/python/testing-fastapi-application/