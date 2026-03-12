# Financial-NLP-System

L00172671 - Oisin Gibson

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [Python](https://www.python.org/downloads/) 3.8 or higher (must be on your system PATH)

### First-time setup
Clone the repo, then run:

```bash
npm run setup
```

This downloads and configures everything automatically:
- Apache Tika (PDF text extraction)
- Java Runtime (required by Tika)
- Tesseract OCR (for scanned PDFs — optional, app works without it)
- Python virtual environment + all NLP packages
- Node.js dependencies for all packages

### Running the app
```bash
npm start
```

This starts all four services together:

| Service | URL |
|---|---|
| React client | http://localhost:3000 |
| API server | http://localhost:8080 |
| NLP microservice | http://localhost:8000 |
| Tika (PDF extraction) | http://localhost:9998 |

### Default accounts
These are created automatically on first run:

| Email | Password | Role |
|---|---|---|
| admin@achilles.com | Admin@123 | Admin |
| demo@achilles.com | Demo@123 | User |

---

## Project Overview
Financial document management and NLP analysis system with:
- React client for upload, document browsing, and NLP UI
- Node/Express API for auth, document storage, and processing orchestration
- Python NLP microservice for extraction and analysis
- Local runtime dependencies for Java/Tika/Tesseract OCR

## Tidy File Map (Readable)
This section focuses on maintained source/config files.
Large generated/runtime/vendor folders are summarized at the end for readability.

### Root
- [package.json](package.json): Workspace-level scripts/dependencies.
- [package-lock.json](package-lock.json): Workspace dependency lock file.
- [README.md](README.md): Project documentation.

### scripts
- [scripts/checkSetup.js](scripts/checkSetup.js): Environment/setup validation helper.
- [scripts/setup.js](scripts/setup.js): Local setup bootstrap script.
- [scripts/startTika.js](scripts/startTika.js): Starts Apache Tika runtime.

### nlp_service
- [nlp_service/main.py](nlp_service/main.py): Python NLP microservice entrypoint.
- [nlp_service/requirements.txt](nlp_service/requirements.txt): Python package requirements.

### server
- [server/.env.example](server/.env.example): Example environment variables.
- [server/package.json](server/package.json): Server scripts/dependencies.
- [server/package-lock.json](server/package-lock.json): Server dependency lock file.
- [server/server.js](server/server.js): Express server bootstrap and route mounting.
- [server/createAdmin.js](server/createAdmin.js): Creates default admin user.
- [server/pdf-diagnostic.js](server/pdf-diagnostic.js): PDF diagnostics utility.
- [server/tika-config.xml](server/tika-config.xml): Tika OCR configuration.
- [server/contracts/nlpResults.json](server/contracts/nlpResults.json): NLP result contract/schema.

#### server/models
- [server/models/User.js](server/models/User.js): User model, auth helpers, password hashing.
- [server/models/Document.js](server/models/Document.js): Document model and NLP-related fields.

#### server/middleware
- [server/middleware/auth.js](server/middleware/auth.js): JWT authentication middleware.

#### server/routes
- [server/routes/auth.js](server/routes/auth.js): Authentication endpoints.
- [server/routes/users.js](server/routes/users.js): Admin/user management endpoints.
- [server/routes/documents.js](server/routes/documents.js): Document route aggregator.
- [server/routes/documents/documentCrudRoutes.js](server/routes/documents/documentCrudRoutes.js): Document CRUD endpoints.
- [server/routes/documents/uploadRoutes.js](server/routes/documents/uploadRoutes.js): Upload endpoints.
- [server/routes/documents/nlpRoutes.js](server/routes/documents/nlpRoutes.js): NLP endpoints.
- [server/routes/documents/nlpProcessing.js](server/routes/documents/nlpProcessing.js): NLP processing flow helpers.
- [server/routes/documents/helpers.js](server/routes/documents/helpers.js): Shared document-route utilities.

#### server/services
- [server/services/nlpProcessor.js](server/services/nlpProcessor.js): Core NLP extraction/processing logic.
- [server/services/nlpMicroservice.js](server/services/nlpMicroservice.js): Integration with Python NLP microservice.

#### server/tests
- [server/tests/auth.test.js](server/tests/auth.test.js): Authentication tests.
- [server/tests/users.test.js](server/tests/users.test.js): User/admin route tests.
- [server/tests/documents.test.js](server/tests/documents.test.js): Document route tests.
- [server/tests/auditFlags.test.js](server/tests/auditFlags.test.js): Audit flag behavior tests.
- [server/tests/nerAccuracy.test.js](server/tests/nerAccuracy.test.js): NER quality/accuracy tests.

### client
- [client/package.json](client/package.json): Client scripts/dependencies.
- [client/package-lock.json](client/package-lock.json): Client dependency lock file.

#### client/public
- [client/public/index.html](client/public/index.html): HTML entry page.
- [client/public/manifest.json](client/public/manifest.json): PWA metadata.
- [client/public/images/logo.png](client/public/images/logo.png): App logo asset.
- [client/public/images/Outlook-ixaxuupp.jpg](client/public/images/Outlook-ixaxuupp.jpg): UI image asset.

#### client/src
- [client/src/index.js](client/src/index.js): React app bootstrap.
- [client/src/App.js](client/src/App.js): Route setup and top-level app layout.
- [client/src/config.js](client/src/config.js): API URL config.
- [client/src/index.css](client/src/index.css): Global styling.
- [client/src/App.css](client/src/App.css): App-level styling.
- [client/src/reportWebVitals.js](client/src/reportWebVitals.js): Web vitals helper.
- [client/src/setupTests.js](client/src/setupTests.js): Test setup.

#### client/src/components (core)
- [client/src/components/Header.js](client/src/components/Header.js): Main navigation/header UI.
- [client/src/components/Footer.js](client/src/components/Footer.js): Footer UI.
- [client/src/components/Dashboard.js](client/src/components/Dashboard.js): Main dashboard page.
- [client/src/components/Login.js](client/src/components/Login.js): Login form/page.
- [client/src/components/Register.js](client/src/components/Register.js): Registration form/page.
- [client/src/components/AdminPanel.js](client/src/components/AdminPanel.js): Admin user management page.
- [client/src/components/UploadDocument.js](client/src/components/UploadDocument.js): Upload page.
- [client/src/components/AlertMessage.js](client/src/components/AlertMessage.js): Shared alert/message component.
- [client/src/components/SelectedFileCard.js](client/src/components/SelectedFileCard.js): Selected upload file summary card.
- [client/src/components/UploadGuidelines.js](client/src/components/UploadGuidelines.js): Upload help text.
- [client/src/components/ProcessingTimes.js](client/src/components/ProcessingTimes.js): Processing time analytics view.
- [client/src/components/ProcessingTimesTable.js](client/src/components/ProcessingTimesTable.js): Processing times table.
- [client/src/components/SummaryCards.js](client/src/components/SummaryCards.js): Processing metric summary cards.
- [client/src/components/ProcessingTimes.styles.js](client/src/components/ProcessingTimes.styles.js): Processing view styles.
- [client/src/components/ProcessingTimes.utils.js](client/src/components/ProcessingTimes.utils.js): Processing helper functions.
- [client/src/components/About.js](client/src/components/About.js): About page.
- [client/src/components/About.css](client/src/components/About.css): About page styles.
- [client/src/components/PrivacyPolicy.js](client/src/components/PrivacyPolicy.js): Privacy policy page.
- [client/src/components/TermsOfService.js](client/src/components/TermsOfService.js): Terms page.
- [client/src/components/Logo.js](client/src/components/Logo.js): Logo component.

#### client/src/components/adminPanel
- [client/src/components/adminPanel/AdminPanelHeader.js](client/src/components/adminPanel/AdminPanelHeader.js): Admin panel header/tab navigation.
- [client/src/components/adminPanel/UserManagementTab.js](client/src/components/adminPanel/UserManagementTab.js): Users tab content wrapper.
- [client/src/components/adminPanel/UserStatisticsCards.js](client/src/components/adminPanel/UserStatisticsCards.js): User metric cards.
- [client/src/components/adminPanel/UserCard.js](client/src/components/adminPanel/UserCard.js): Single user card UI.

#### client/src/components/documents
- [client/src/components/documents/Documents.js](client/src/components/documents/Documents.js): Documents page and grouping logic.
- [client/src/components/documents/Documents.css](client/src/components/documents/Documents.css): Documents page styles.
- [client/src/components/documents/DocumentCard.js](client/src/components/documents/DocumentCard.js): Main document card wrapper.
- [client/src/components/documents/DocumentStatistics.js](client/src/components/documents/DocumentStatistics.js): Documents statistics section.
- [client/src/components/documents/EmptyDocuments.js](client/src/components/documents/EmptyDocuments.js): Empty-state documents UI.
- [client/src/components/documents/FileDropZone.js](client/src/components/documents/FileDropZone.js): Drag/drop file upload area.

#### client/src/components/documents/documentCard
- [client/src/components/documents/documentCard/DocumentCardHeader.js](client/src/components/documents/documentCard/DocumentCardHeader.js): Document card header section.
- [client/src/components/documents/documentCard/DocumentCardMeta.js](client/src/components/documents/documentCard/DocumentCardMeta.js): Document metadata section.
- [client/src/components/documents/documentCard/DocumentCardRagBadge.js](client/src/components/documents/documentCard/DocumentCardRagBadge.js): RAG badge section.
- [client/src/components/documents/documentCard/DocumentCardActions.js](client/src/components/documents/documentCard/DocumentCardActions.js): Document action buttons.

#### client/src/components/login
- [client/src/components/login/LoginHeader.js](client/src/components/login/LoginHeader.js): Login page header block.
- [client/src/components/login/LoginSubmitButton.js](client/src/components/login/LoginSubmitButton.js): Login submit button/loading state.

#### client/src/components/nlp
- [client/src/components/nlp/NLPAnalysis.js](client/src/components/nlp/NLPAnalysis.js): NLP modal data-loading container.
- [client/src/components/nlp/NLPAnalysisView.js](client/src/components/nlp/NLPAnalysisView.js): NLP analysis page-level renderer.
- [client/src/components/nlp/NLPAnalysis.styles.js](client/src/components/nlp/NLPAnalysis.styles.js): NLP UI style definitions.
- [client/src/components/nlp/NLPAnalysis.utils.js](client/src/components/nlp/NLPAnalysis.utils.js): NLP helper functions.
- [client/src/components/nlp/NLPAnalysisContentSections.js](client/src/components/nlp/NLPAnalysisContentSections.js): NLP content section composer.
- [client/src/components/nlp/NLPAnalysisOverviewSection.js](client/src/components/nlp/NLPAnalysisOverviewSection.js): NLP overview/statistics section.
- [client/src/components/nlp/NLPAnalysisEntitiesSection.js](client/src/components/nlp/NLPAnalysisEntitiesSection.js): Named entity display section.
- [client/src/components/nlp/NLPAnalysisDocumentSections.js](client/src/components/nlp/NLPAnalysisDocumentSections.js): Document text/frequency section.
- [client/src/components/nlp/NLPAnalysisAuditPanel.js](client/src/components/nlp/NLPAnalysisAuditPanel.js): Audit flags container panel.
- [client/src/components/nlp/NLPAnalysisAuditRagCard.js](client/src/components/nlp/NLPAnalysisAuditRagCard.js): RAG status card.
- [client/src/components/nlp/NLPAnalysisAuditFlagList.js](client/src/components/nlp/NLPAnalysisAuditFlagList.js): Audit flag list/evidence renderer.

#### client/src/hooks
- [client/src/hooks/useAlert.js](client/src/hooks/useAlert.js): Alert-state custom hook.
- [client/src/hooks/useDocuments.js](client/src/hooks/useDocuments.js): Document fetch/delete hook.
- [client/src/hooks/useFileUpload.js](client/src/hooks/useFileUpload.js): File upload flow hook.

#### client/src/utils
- [client/src/utils/alertUtils.js](client/src/utils/alertUtils.js): Alert formatting/helpers.
- [client/src/utils/documentUtils.js](client/src/utils/documentUtils.js): Document format/download/group helpers.
- [client/src/utils/fileUtils.js](client/src/utils/fileUtils.js): File validation/upload helpers.

## Large Runtime/Generated Areas (Summarized)
These exist in the repo but are intentionally not expanded line-by-line here to keep this README readable:
- [client/build](client/build): Built frontend artifacts and source maps.
- [server/uploads](server/uploads): Uploaded document files.
- [server/lib](server/lib): JAR dependencies for OCR/image support.
- [runtimes](runtimes): Bundled Java/Tika/Tesseract runtime binaries and docs.
- [nlp_service/venv](nlp_service/venv): Python virtual environment and installed packages.
- [server/database.sqlite](server/database.sqlite): Local SQLite database file.

=======================================================================================================================================
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

#### JPEG2000 OCR Support (Scanned PDFs)
Some scanned PDFs use JPEG2000 (JP2) images. To OCR these, add the JAI Image I/O JARs:

1. Download:
   - `jai-imageio-core-*.jar`
   - `jai-imageio-jpeg2000-*.jar`
2. Place both files in [server/lib](server/lib)
3. Restart Tika (`npm run tika`)

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
