import { spawn } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdtempSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default paths use local runtimes folder
const runtimesDir = path.join(__dirname, '..', 'runtimes');
const jarPath = process.env.TIKA_JAR || path.join(runtimesDir, 'tika', 'tika-server-standard-3.2.3.jar');
const javaBin = process.env.JAVA_BIN || path.join(runtimesDir, 'jre', 'bin', 'java.exe');
const tesseractPath = process.env.TESSERACT_PATH || path.join(runtimesDir, 'tesseract');
const tesseractDataPath = process.env.TESSERACT_DATAPATH || path.join(runtimesDir, 'tesseract', 'tessdata');
const defaultTikaConfigPath = path.join(__dirname, '..', 'server', 'tika-config.xml');
const tikaHost = process.env.TIKA_HOST;
const tikaPort = process.env.TIKA_PORT;

if (!existsSync(jarPath)) {
  console.error(`Tika JAR not found at: ${jarPath}`);
  console.error('Run the setup script or download runtimes manually. See runtimes/README.md');
  process.exit(1);
}

if (!existsSync(javaBin)) {
  console.error(`Java not found at: ${javaBin}`);
  console.error('Run the setup script or download JRE to runtimes/jre/');
  process.exit(1);
}

// Generate config with absolute Tesseract paths
let tikaConfigPath;
if (existsSync(defaultTikaConfigPath)) {
  let configContent = readFileSync(defaultTikaConfigPath, 'utf8');
  
  // Inject Tesseract paths if Tesseract is installed
  if (existsSync(tesseractPath)) {
    const tesseractParams = `
        <param name="tesseractPath" type="string">${tesseractPath}</param>
        <param name="tesseractDataPath" type="string">${tesseractDataPath}</param>`;
    configContent = configContent.replace(
      /(<parser class="org.apache.tika.parser.ocr.TesseractOCRParser">[\s\S]*?<params>)/,
      `$1${tesseractParams}`
    );
    console.log(`Tesseract OCR enabled: ${tesseractPath}`);
  } else {
    console.warn(`Tesseract not found at: ${tesseractPath}`);
    console.warn('OCR will be disabled. Install Tesseract to runtimes/tesseract/');
  }
  
  // Write to temp file
  const tempDir = mkdtempSync(path.join(tmpdir(), 'tika-'));
  tikaConfigPath = path.join(tempDir, 'tika-config.xml');
  writeFileSync(tikaConfigPath, configContent);
}

const extraLibDir = path.join(__dirname, '..', 'server', 'lib');
const hasExtraJars = existsSync(extraLibDir) && readdirSync(extraLibDir).some((file) => file.endsWith('.jar'));

let args;
if (hasExtraJars) {
  const classpath = [jarPath, path.join(extraLibDir, '*')].join(';');
  args = ['-cp', classpath, 'org.apache.tika.server.core.TikaServerCli'];
  console.log(`Including extra JARs from: ${extraLibDir}`);
} else {
  console.warn('No extra JARs found in server/lib. JPEG2000 PDFs may fail OCR without jai-imageio JARs.');
  args = ['-jar', jarPath];
}

if (tikaHost) {
  args.push('--host', tikaHost);
}

if (tikaPort) {
  args.push('--port', tikaPort);
}

if (tikaConfigPath) {
  if (existsSync(tikaConfigPath)) {
    args.push('--config', tikaConfigPath);
  } else {
    console.warn(`Tika config not found at: ${tikaConfigPath}`);
    console.warn('Continuing without a custom Tika config. Set TIKA_CONFIG to a valid path to enable it.');
  }
} else {
  console.warn('TIKA_CONFIG not set. Starting Tika with default config.');
}

const tika = spawn(javaBin, args, {
  stdio: 'inherit'
});

tika.on('exit', (code) => {
  process.exit(code ?? 0);
});

//https://www.tutorialspoint.com/tika/tika_overview.htm