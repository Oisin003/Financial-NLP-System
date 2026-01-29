# Financial-NLP-System

L00172671 - Oisin Gibson

## File Overview (Brief)

### Root
- [package.json](package.json): Workspace scripts and shared deps.
- [README.md](README.md): Project notes and references.

### Server
- [server/package.json](server/package.json): Server deps and scripts.
- [server/server.js](server/server.js): Express app, DB init, routes, cleanup job.
- [server/createAdmin.js](server/createAdmin.js): One‑off admin user creator.
- [server/tika-config.xml](server/tika-config.xml): Tika OCR configuration.

#### Server Models
- [server/models/User.js](server/models/User.js): User schema + auth helpers.
- [server/models/Document.js](server/models/Document.js): Document schema + NLP fields.

#### Server Routes
- [server/routes/auth.js](server/routes/auth.js): Login and registration endpoints.
- [server/routes/users.js](server/routes/users.js): Admin user management endpoints.
- [server/routes/documents.js](server/routes/documents.js): Upload, download, NLP endpoints.

#### Server Middleware
- [server/middleware/auth.js](server/middleware/auth.js): JWT auth guard.

#### Server Services
- [server/services/nlpProcessor.js](server/services/nlpProcessor.js): Text extraction + NLP pipeline.

#### Server Tests
- [server/tests/auth.test.js](server/tests/auth.test.js): Auth route tests.
- [server/tests/documents.test.js](server/tests/documents.test.js): Document route tests.
- [server/tests/users.test.js](server/tests/users.test.js): User route tests.

#### Server Contracts
- [server/contracts/nlpResults.json](server/contracts/nlpResults.json): NLP results JSON contract.

### Client
- [client/package.json](client/package.json): Client deps and scripts.
- [client/public/index.html](client/public/index.html): HTML entry point.
- [client/public/manifest.json](client/public/manifest.json): PWA metadata.

#### Client Entry
- [client/src/index.js](client/src/index.js): React bootstrap.
- [client/src/App.js](client/src/App.js): Routes and app layout.
- [client/src/config.js](client/src/config.js): API base URL.
- [client/src/index.css](client/src/index.css): Global styles.
- [client/src/App.css](client/src/App.css): App styles.
- [client/src/reportWebVitals.js](client/src/reportWebVitals.js): Perf reporting.
- [client/src/setupTests.js](client/src/setupTests.js): Test setup.

#### Client Components
- [client/src/components/AdminPanel.js](client/src/components/AdminPanel.js): Admin user management UI.
- [client/src/components/AlertMessage.js](client/src/components/AlertMessage.js): Reusable alert UI.
- [client/src/components/Dashboard.js](client/src/components/Dashboard.js): Main dashboard UI.
- [client/src/components/DocumentCard.js](client/src/components/DocumentCard.js): Document list card.
- [client/src/components/Documents.js](client/src/components/Documents.js): Document list page.
- [client/src/components/DocumentStatistics.js](client/src/components/DocumentStatistics.js): Document stats UI.
- [client/src/components/EmptyDocuments.js](client/src/components/EmptyDocuments.js): Empty state UI.
- [client/src/components/FileDropZone.js](client/src/components/FileDropZone.js): Drag‑and‑drop upload area.
- [client/src/components/Footer.js](client/src/components/Footer.js): Footer UI.
- [client/src/components/Header.js](client/src/components/Header.js): Header/nav UI.
- [client/src/components/Login.js](client/src/components/Login.js): Login form.
- [client/src/components/Logo.js](client/src/components/Logo.js): Logo SVG.
- [client/src/components/NLPAnalysis.js](client/src/components/NLPAnalysis.js): NLP modal container.
- [client/src/components/NLPAnalysisView.js](client/src/components/NLPAnalysisView.js): NLP modal UI.
- [client/src/components/NLPAnalysis.styles.js](client/src/components/NLPAnalysis.styles.js): NLP modal styles.
- [client/src/components/Register.js](client/src/components/Register.js): Registration form.
- [client/src/components/SelectedFileCard.js](client/src/components/SelectedFileCard.js): Selected file preview.
- [client/src/components/UploadDocument.js](client/src/components/UploadDocument.js): Upload page.
- [client/src/components/UploadGuidelines.js](client/src/components/UploadGuidelines.js): Upload tips UI.

#### Client Hooks
- [client/src/hooks/useAlert.js](client/src/hooks/useAlert.js): Alert state hook.
- [client/src/hooks/useDocuments.js](client/src/hooks/useDocuments.js): Documents data hook.
- [client/src/hooks/useFileUpload.js](client/src/hooks/useFileUpload.js): Upload state hook.

#### Client Utils
- [client/src/utils/alertUtils.js](client/src/utils/alertUtils.js): Alert helpers.
- [client/src/utils/documentUtils.js](client/src/utils/documentUtils.js): Document helpers.
- [client/src/utils/fileUtils.js](client/src/utils/fileUtils.js): File helpers.

### Scripts
- [scripts/startTika.js](scripts/startTika.js): Starts Tika server with config.

==============================================================================================================================================================================================================================
Reference Material
------------------

- **Tokenization Concepts**
  - Manning, C. D., & Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press.
  
- **Stopword Removal**
  - Common English stopwords list based on NLTK (Natural Language Toolkit)
  - Bird, S., Klein, E., & Loper, E. (2009). *Natural Language Processing with Python*. O'Reilly Media.

### PDF Processing
- **pdf-parse Library**
  - GitHub: https://github.com/modesty/pdf-parse
  - Uses Mozilla's PDF.js for parsing

### Tika, OCR, and Tesseract
- **Apache Tika**
  - Download: https://tika.apache.org/download.html
  - Server: https://cwiki.apache.org/confluence/display/TIKA/TikaServer
- **Tesseract OCR** (Windows builds)
  - Downloads: https://github.com/UB-Mannheim/tesseract/wiki
- **Tesseract OCR** (Official)
  - Project: https://github.com/tesseract-ocr/tesseract

- **React (W3Schools)**: https://www.w3schools.com/react/
- **SQL (W3Schools)**: https://www.w3schools.com/sql/
- **Node.js (GeeksforGeeks)**: https://www.geeksforgeeks.org/nodejs/
- **Express.js (GeeksforGeeks)**: https://www.geeksforgeeks.org/express-js/
- **JWT (GeeksforGeeks)**: https://www.geeksforgeeks.org/json-web-token-jwt/
- **bcrypt (GeeksforGeeks)**: https://www.geeksforgeeks.org/bcrypt-hashing-in-nodejs/

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


