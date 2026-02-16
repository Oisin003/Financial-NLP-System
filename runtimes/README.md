# Local Runtimes Folder

This folder contains the runtime dependencies (Tika, JRE, Tesseract) required for the application.

## Quick Setup (Recommended)

Run from the project root:
```bash
npm run setup
```

This will automatically download and configure all required components.

## Manual Setup

If automatic setup fails, place the following components here:

### Structure
```
runtimes/
├── tika/
│   ├── tika-server-standard-3.2.3.jar
│   └── (optional additional JARs like jai-imageio)
├── jre/
│   └── bin/
│       └── java.exe
└── tesseract/
    ├── tesseract.exe
    └── tessdata/
        └── eng.traineddata
```

### Downloads

#### Apache Tika Server JAR
- https://tika.apache.org/download.html
- Download: `tika-server-standard-X.X.X.jar`

#### Portable JRE (Java Runtime)
- https://adoptium.net/temurin/releases/
- Select: Windows x64, JRE, .zip
- Extract contents to `runtimes/jre/`

#### Tesseract OCR (Portable)
- https://github.com/UB-Mannheim/tesseract/wiki
- Download installer, extract, or use portable version
- Place in `runtimes/tesseract/`
- Ensure `tessdata/` folder contains language files (at minimum `eng.traineddata`)

## Notes
- These files are intentionally gitignored due to size
- The `npm run tika` script automatically uses these paths
- Override via environment variables if needed: TIKA_JAR, JAVA_BIN, TESSERACT_PATH
