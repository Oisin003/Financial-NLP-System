import { execFileSync, execSync } from 'child_process';
import { existsSync, mkdirSync, renameSync, unlinkSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const runtimesDir = path.join(rootDir, 'runtimes');
const localTesseractDir = path.join(runtimesDir, 'tesseract');

const TIKA_VERSION = '3.2.3';
const JRE_VERSION = '21.0.5+11';
const TESSERACT_VERSION = '5.5.0.20241111';

function findLocalTesseractExe() {
  const candidates = [
    path.join(localTesseractDir, 'tesseract.exe'),
    path.join(localTesseractDir, 'bin', 'tesseract.exe'),
    path.join(localTesseractDir, 'Tesseract-OCR', 'tesseract.exe')
  ];

  return candidates.find((candidate) => existsSync(candidate)) || null;
}

const DOWNLOADS = {
  tika: {
    url: `https://dlcdn.apache.org/tika/${TIKA_VERSION}/tika-server-standard-${TIKA_VERSION}.jar`,
    dest: path.join(runtimesDir, 'tika', `tika-server-standard-${TIKA_VERSION}.jar`),
    check: () => existsSync(path.join(runtimesDir, 'tika', `tika-server-standard-${TIKA_VERSION}.jar`))
  },
  jre: {
    url: `https://github.com/adoptium/temurin21-binaries/releases/download/jdk-${JRE_VERSION}/OpenJDK21U-jre_x64_windows_hotspot_21.0.5_11.zip`,
    dest: path.join(runtimesDir, 'jre.zip'),
    check: () => existsSync(path.join(runtimesDir, 'jre', 'bin', 'java.exe'))
  },
  tesseract: {
    url: `https://github.com/tesseract-ocr/tesseract/releases/download/5.5.0/tesseract-ocr-w64-setup-${TESSERACT_VERSION}.exe`,
    dest: path.join(runtimesDir, 'tesseract-installer.exe'),
    check: () => Boolean(findLocalTesseractExe())
  }
};

async function setupTika() {
  console.log('\nSetting up Apache Tika...');
  if (DOWNLOADS.tika.check()) {
    console.log('  Tika already installed');
    return;
  }
  
  mkdirSync(path.join(runtimesDir, 'tika'), { recursive: true });
  
  try {
    execFileSync('curl', ['-L', '--progress-bar', '-o', DOWNLOADS.tika.dest, DOWNLOADS.tika.url], { stdio: 'inherit' });
    console.log('Tika installed');
  } catch (err) {
    console.error('Failed to download Tika. Please download manually from:');
    console.error(`     ${DOWNLOADS.tika.url}`);
  }
}

async function setupJRE() {
  console.log('\n Setting up Java Runtime...');
  if (DOWNLOADS.jre.check()) {
    console.log('JRE already installed');
    return;
  }
  
  mkdirSync(path.join(runtimesDir, 'jre'), { recursive: true });
  
  try {
    execFileSync('curl', ['-L', '--progress-bar', '-o', DOWNLOADS.jre.dest, DOWNLOADS.jre.url], { stdio: 'inherit' });
    
    console.log('  Extracting...');
    execSync(`tar -xf "${DOWNLOADS.jre.dest}" -C "${runtimesDir}"`, { stdio: 'inherit' });
    
    // Find extracted folder and rename
    const extracted = readdirSync(runtimesDir).find(f => f.startsWith('jdk-') && f.includes('-jre'));
    if (extracted) {
      const oldPath = path.join(runtimesDir, extracted);
      const newPath = path.join(runtimesDir, 'jre');
      if (existsSync(newPath)) {
        execSync(`rmdir /s /q "${newPath}"`, { stdio: 'inherit' });
      }
      renameSync(oldPath, newPath);
    }
    
    unlinkSync(DOWNLOADS.jre.dest);
    console.log('JRE installed');
  } catch (err) {
    console.error('Failed to setup JRE. Please download manually from:');
    console.error('     https://adoptium.net/temurin/releases/');
  }
}

async function setupTesseract() {
  console.log('\n Setting up Tesseract OCR...');
  if (DOWNLOADS.tesseract.check()) {
    console.log(`Tesseract already installed at: ${findLocalTesseractExe()}`);
    return;
  }

  const installerPath = DOWNLOADS.tesseract.dest;

  const installerAttempts = [
    ['/S', `/D=${localTesseractDir}`],
    ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART', `/DIR=${localTesseractDir}`],
    ['/SILENT', '/SUPPRESSMSGBOXES', '/NORESTART', `/DIR=${localTesseractDir}`]
  ];

  const runInstaller = () => {
    for (const args of installerAttempts) {
      try {
        execFileSync(installerPath, args, { stdio: 'inherit' });
      } catch {
        // Try the next installer mode.
      }

      if (DOWNLOADS.tesseract.check()) {
        return true;
      }
    }
    return false;
  };
  
  try {
    if (!existsSync(installerPath)) {
      execFileSync('curl', ['-L', '--progress-bar', '-o', installerPath, DOWNLOADS.tesseract.url], { stdio: 'inherit' });
    } else {
      console.log(`  Using bundled installer: ${installerPath}`);
    }

    console.log('  Running installer (this may take a moment)...');
    runInstaller();
    
    // Wait briefly for silent install to finish writing files.
    for (let i = 0; i < 20; i++) {
      if (DOWNLOADS.tesseract.check()) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    const tesseractExe = findLocalTesseractExe();
    if (tesseractExe) {
      console.log(`   Tesseract installed at: ${tesseractExe}`);
    } else {
      console.log('    Silent install may have failed. Please run the installer manually:');
      console.log(`     ${DOWNLOADS.tesseract.dest}`);
      console.log(`     Install to: ${localTesseractDir}`);
    }
  } catch (err) {
    console.error('   Failed to setup Tesseract. Please download manually from:');
    console.error('     https://github.com/UB-Mannheim/tesseract/wiki');
  }
}

async function setupPythonVenv() {
  console.log('\n Setting up Python environment...');
  const venvPath = path.join(rootDir, 'nlp_service', 'venv');
  const requirementsPath = path.join(rootDir, 'nlp_service', 'requirements.txt');
  const pythonExe = path.join(venvPath, 'Scripts', 'python.exe');
  const pipExe = path.join(venvPath, 'Scripts', 'pip.exe');
  
  if (existsSync(pythonExe)) {
    console.log('   Python venv already exists');
  } else {
    try {
      console.log('  Creating virtual environment...');
      execSync(`python -m venv "${venvPath}"`, { cwd: path.join(rootDir, 'nlp_service'), stdio: 'inherit' });
      console.log('   Virtual environment created');
    } catch (err) {
      console.error('   Failed to create venv. Please ensure Python is installed.');
      return;
    }
  }
  
  try {
    if (existsSync(requirementsPath)) {
      console.log('  Installing Python dependencies...');
      execSync(`"${pipExe}" install -r requirements.txt`, { 
        cwd: path.join(rootDir, 'nlp_service'), 
        stdio: 'inherit' 
      });
    }
    
    console.log('  Downloading spaCy language model...');
    execSync(`"${pythonExe}" -m spacy download en_core_web_sm`, { 
      cwd: path.join(rootDir, 'nlp_service'), 
      stdio: 'inherit' 
    });
    
    console.log('   Python environment ready');
  } catch (err) {
    console.error('   Failed to install Python dependencies.');
    console.error('     Run manually: cd nlp_service && venv\\Scripts\\pip install -r requirements.txt');
    console.error('     Then: venv\\Scripts\\python -m spacy download en_core_web_sm');
  }
}

async function setupNodeModules() {
  console.log('\n Installing Node.js dependencies...');
  
  try {
    if (!existsSync(path.join(rootDir, 'node_modules'))) {
      execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    }
    if (!existsSync(path.join(rootDir, 'server', 'node_modules'))) {
      execSync('npm install', { cwd: path.join(rootDir, 'server'), stdio: 'inherit' });
    }
    if (!existsSync(path.join(rootDir, 'client', 'node_modules'))) {
      execSync('npm install', { cwd: path.join(rootDir, 'client'), stdio: 'inherit' });
    }
    console.log('   Node dependencies installed');
  } catch (err) {
    console.error('   Failed to install Node dependencies');
  }
}

async function main() {
  console.log(' Financial NLP System - Setup\n');
  console.log('This script will download and configure all required components.\n');
  
  mkdirSync(runtimesDir, { recursive: true });
  
  await setupTika();
  await setupJRE();
  await setupTesseract();
  await setupPythonVenv();
  await setupNodeModules();
  
  console.log('\n' + '='.repeat(50));
  console.log(' Setup complete!\n');
  console.log('Run the application with: npm start');
  console.log('='.repeat(50));
}

main().catch(console.error);
