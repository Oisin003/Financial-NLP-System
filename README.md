# Financial-NLP-System

A document management system with NLP analysis for financial PDFs. Users can upload financial documents, which are automatically processed to extract key terms, word frequencies, and meaningful insights.

## Project Structure

### Server (Backend)

#### Core Files
- **server.js** - Main server entry point; sets up Express, connects database, configures routes
- **createAdmin.js** - Utility script to create admin user account (run once during setup)
- **package.json** - Server dependencies and npm scripts

#### Models (`server/models/`)
- **User.js** - User database schema; handles authentication, password hashing with bcrypt
- **Document.js** - Document database schema; stores PDF metadata and NLP analysis results

#### Routes (`server/routes/`)
- **auth.js** - Login and registration endpoints; JWT token generation
- **users.js** - User management endpoints (list, delete users); admin operations
- **documents.js** - Document upload, download, delete, and NLP analysis endpoints

#### Middleware (`server/middleware/`)
- **auth.js** - JWT authentication middleware; protects routes, verifies user permissions

#### Services (`server/services/`)
- **nlpProcessor.js** - NLP analysis engine; extracts text from PDFs, tokenizes, removes stopwords, calculates word frequencies

### Client (Frontend)

#### Core Files
- **App.js** - Main React component; manages routing, authentication state, protected routes
- **index.js** - React app entry point; renders App component
- **config.js** - Configuration file with backend API URL
- **package.json** - Client dependencies and npm scripts

#### Components (`client/src/components/`)
- **Header.js** - Top navigation bar; shows user info, logout button, dynamic menu
- **Footer.js** - Site footer with company info and links
- **Login.js** - Login form; authenticates users, stores JWT token
- **Register.js** - Registration form; creates new user accounts with password validation
- **Dashboard.js** - Main dashboard after login; overview of system features
- **Documents.js** - Document list page; displays user's uploaded documents
- **UploadDocument.js** - File upload page; handles PDF uploads with drag-and-drop
- **AdminPanel.js** - Admin-only page; user management, system statistics
- **NLPAnalysis.js** - Displays NLP analysis results for a document
- **DocumentCard.js** - Individual document card component for document list
- **AlertMessage.js** - Reusable alert/notification component
- **Logo.js** - Company logo SVG component

#### Hooks (`client/src/hooks/`)
- **useAlert.js** - Custom hook for managing alert messages
- **useDocuments.js** - Custom hook for fetching and managing documents
- **useFileUpload.js** - Custom hook for handling file upload logic

#### Utils (`client/src/utils/`)
- **alertUtils.js** - Alert type constants and helper functions for styling
- **documentUtils.js** - Document-related utility functions
- **fileUtils.js** - File validation and formatting utilities

## References & Resources

## NLP Results JSON Contract

The backend and NLP pipeline exchange data using a JSON contract defined in [server/contracts/nlpResults.json](server/contracts/nlpResults.json).

- `documentId`: Database ID of the document.
- `originalName`: Original filename uploaded by the user.
- `nlpProcessed`: Whether NLP processing is complete.
- `rawText`: Full extracted text from the PDF.
- `processedTokens`: Array of cleaned/lemmatized tokens.
- `wordFrequency`: Map of token → count.
- `topWords`: Array of the top 20 tokens, each with `{ word, count }`.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

### Natural Language Processing
- **Natural Node** - NLP library for Node.js
  - Documentation: https://github.com/NaturalNode/natural
  - Lancaster Stemming Algorithm: Porter, M.F. (1980). "An algorithm for suffix stripping"
  
- **Tokenization Concepts**
  - Manning, C. D., & Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press.
  
- **Stopword Removal**
  - Common English stopwords list based on NLTK (Natural Language Toolkit)
  - Bird, S., Klein, E., & Loper, E. (2009). *Natural Language Processing with Python*. O'Reilly Media.

### PDF Processing
- **pdf-parse Library**
  - GitHub: https://github.com/modesty/pdf-parse
  - Uses Mozilla's PDF.js for parsing
  
- **PDF.js** - Mozilla's PDF rendering engine
  - Documentation: https://mozilla.github.io/pdf.js/

### Web Development Frameworks
- **React Documentation**
  - Official Docs: https://react.dev/
  - React Hooks: https://react.dev/reference/react
  
- **Express.js** - Web framework for Node.js
  - Official Guide: https://expressjs.com/
  
- **Sequelize ORM**
  - Documentation: https://sequelize.org/docs/v6/

### UI/UX Design
- **Bootstrap 5**
  - Documentation: https://getbootstrap.com/docs/5.0/
  - Icons: https://icons.getbootstrap.com/
  
- **Component-Based Architecture**
  - Fowler, M. (2003). "Patterns of Enterprise Application Architecture"

### Authentication & Security
- **JSON Web Tokens (JWT)**
  - RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
  - jwt.io: https://jwt.io/introduction
  
- **bcrypt** - Password hashing
  - GitHub: https://github.com/kelektiv/node.bcrypt.js

### File Upload Handling
- **Multer** - Node.js middleware for multipart/form-data
  - Documentation: https://github.com/expressjs/multer

### Data Retention & Scheduling
- **node-cron** - Scheduled jobs in Node.js
  - Documentation: https://www.npmjs.com/package/node-cron

### File Upload Security (Validation & Sanitization)
- **OWASP File Upload Cheat Sheet**
  - Guidance: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- **file-type** - Detect file signature (magic bytes)
  - Documentation: https://www.npmjs.com/package/file-type


