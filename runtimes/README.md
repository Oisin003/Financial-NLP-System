# Local Runtimes Folder

This folder contains the runtime dependencies (Tika, JRE, Tesseract) required for the application.

## Quick Setup (Recommended)

Run from the project root:
```bash
npm run setup
```

This will automatically download and configure all required components.

If you want fresh GitHub clones to work without any installer step, commit a portable
Tesseract runtime directly under `runtimes/tesseract/`. The app already prefers that
folder and will use it immediately on startup.

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

Recommended portable layout for committing to the repo:
```
runtimes/
└── tesseract/
    ├── tesseract.exe
    ├── *.dll
    └── tessdata/
        └── eng.traineddata
```

## Notes
- The easiest user experience is to commit a portable `runtimes/tesseract/` folder so OCR is ready on first run
- The bundled `tesseract-installer.exe` is only a fallback when the portable folder is not present
- `runtimes/tesseract/` is allowed in git; other extracted runtime folders remain gitignored due to size
- The `npm run tika` script automatically uses these paths
- Override via environment variables if needed: TIKA_JAR, JAVA_BIN, TESSERACT_PATH
