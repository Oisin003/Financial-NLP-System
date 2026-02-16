import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, renameSync, unlinkSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const runtimesDir = path.join(rootDir, 'runtimes');

const TIKA_VERSION = '3.2.3';
const JRE_VERSION = '21.0.5+11';
const TESSERACT_VERSION = '5.5.0.20241111';

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
    check: () => existsSync(path.join(runtimesDir, 'tesseract', 'tesseract.exe'))
  }
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    const file = fs.createWriteStream(dest);
    
    const request = (url) => {
      const protocol = url.startsWith('https') ? https : require('http');
      protocol.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          request(response.headers.location);
          return;
        }
        
        const total = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;
        
        response.on('data', (chunk) => {
          downloaded += chunk.length;
          const percent = total ? Math.round((downloaded / total) * 100) : 0;
          process.stdout.write(`\r  Progress: ${percent}%`);
        });
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(' Done!');
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };
    
    request(url);
  });
}

async function setupTika() {
  console.log('\n📦 Setting up Apache Tika...');
  if (DOWNLOADS.tika.check()) {
    console.log('  ✅ Tika already installed');
    return;
  }
  
  mkdirSync(path.join(runtimesDir, 'tika'), { recursive: true });
  
  try {
    execSync(`curl -L --progress-bar -o "${DOWNLOADS.tika.dest}" "${DOWNLOADS.tika.url}"`, { stdio: 'inherit' });
    console.log('  ✅ Tika installed');
  } catch (err) {
    console.error('  ❌ Failed to download Tika. Please download manually from:');
    console.error(`     ${DOWNLOADS.tika.url}`);
  }
}

async function setupJRE() {
  console.log('\n☕ Setting up Java Runtime...');
  if (DOWNLOADS.jre.check()) {
    console.log('  ✅ JRE already installed');
    return;
  }
  
  mkdirSync(path.join(runtimesDir, 'jre'), { recursive: true });
  
  try {
    execSync(`curl -L --progress-bar -o "${DOWNLOADS.jre.dest}" "${DOWNLOADS.jre.url}"`, { stdio: 'inherit' });
    
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
    console.log('  ✅ JRE installed');
  } catch (err) {
    console.error('  ❌ Failed to setup JRE. Please download manually from:');
    console.error('     https://adoptium.net/temurin/releases/');
  }
}

async function setupTesseract() {
  console.log('\n🔍 Setting up Tesseract OCR...');
  if (DOWNLOADS.tesseract.check()) {
    console.log('  ✅ Tesseract already installed');
    return;
  }
  
  try {
    execSync(`curl -L --progress-bar -o "${DOWNLOADS.tesseract.dest}" "${DOWNLOADS.tesseract.url}"`, { stdio: 'inherit' });
    
    console.log('  Running installer (this may take a moment)...');
    execSync(`"${DOWNLOADS.tesseract.dest}" /S /D=${path.join(runtimesDir, 'tesseract')}`, { stdio: 'inherit' });
    
    // Wait for installation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (DOWNLOADS.tesseract.check()) {
      console.log('  ✅ Tesseract installed');
    } else {
      console.log('  ⚠️  Silent install may have failed. Please run the installer manually:');
      console.log(`     ${DOWNLOADS.tesseract.dest}`);
      console.log(`     Install to: ${path.join(runtimesDir, 'tesseract')}`);
    }
  } catch (err) {
    console.error('  ❌ Failed to setup Tesseract. Please download manually from:');
    console.error('     https://github.com/UB-Mannheim/tesseract/wiki');
  }
}

async function setupPythonVenv() {
  console.log('\n🐍 Setting up Python environment...');
  const venvPath = path.join(rootDir, 'nlp_service', 'venv');
  const requirementsPath = path.join(rootDir, 'nlp_service', 'requirements.txt');
  const pythonExe = path.join(venvPath, 'Scripts', 'python.exe');
  const pipExe = path.join(venvPath, 'Scripts', 'pip.exe');
  
  if (existsSync(pythonExe)) {
    console.log('  ✅ Python venv already exists');
  } else {
    try {
      console.log('  Creating virtual environment...');
      execSync(`python -m venv "${venvPath}"`, { cwd: path.join(rootDir, 'nlp_service'), stdio: 'inherit' });
      console.log('  ✅ Virtual environment created');
    } catch (err) {
      console.error('  ❌ Failed to create venv. Please ensure Python is installed.');
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
    
    console.log('  ✅ Python environment ready');
  } catch (err) {
    console.error('  ❌ Failed to install Python dependencies.');
    console.error('     Run manually: cd nlp_service && venv\\Scripts\\pip install -r requirements.txt');
    console.error('     Then: venv\\Scripts\\python -m spacy download en_core_web_sm');
  }
}

async function setupNodeModules() {
  console.log('\n📦 Installing Node.js dependencies...');
  
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
    console.log('  ✅ Node dependencies installed');
  } catch (err) {
    console.error('  ❌ Failed to install Node dependencies');
  }
}

async function main() {
  console.log('🚀 Financial NLP System - Setup\n');
  console.log('This script will download and configure all required components.\n');
  
  mkdirSync(runtimesDir, { recursive: true });
  
  await setupTika();
  await setupJRE();
  await setupTesseract();
  await setupPythonVenv();
  await setupNodeModules();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Setup complete!\n');
  console.log('Run the application with: npm start');
  console.log('='.repeat(50));
}

main().catch(console.error);
