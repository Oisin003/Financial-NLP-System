import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const checks = [
  {
    name: 'Node dependencies (root)',
    path: path.join(rootDir, 'node_modules', 'concurrently'),
    fix: () => execSync('npm install', { cwd: rootDir, stdio: 'inherit' })
  },
  {
    name: 'Node dependencies (server)',
    path: path.join(rootDir, 'server', 'node_modules'),
    fix: () => execSync('npm install', { cwd: path.join(rootDir, 'server'), stdio: 'inherit' })
  },
  {
    name: 'Node dependencies (client)',
    path: path.join(rootDir, 'client', 'node_modules'),
    fix: () => execSync('npm install', { cwd: path.join(rootDir, 'client'), stdio: 'inherit' })
  },
  {
    name: 'Apache Tika',
    path: path.join(rootDir, 'runtimes', 'tika', 'tika-server-standard-3.2.3.jar'),
    fix: null // Requires setup script
  },
  {
    name: 'Java Runtime (JRE)',
    path: path.join(rootDir, 'runtimes', 'jre', 'bin', 'java.exe'),
    fix: null
  },
  {
    name: 'Tesseract OCR',
    path: path.join(rootDir, 'runtimes', 'tesseract', 'tesseract.exe'),
    fix: null
  },
  {
    name: 'Python virtual environment',
    path: path.join(rootDir, 'nlp_service', 'venv', 'Scripts', 'python.exe'),
    fix: null
  }
];

let needsSetup = false;
let needsNodeInstall = [];

console.log('🔍 Checking dependencies...\n');

for (const check of checks) {
  if (!existsSync(check.path)) {
    console.log(`❌ Missing: ${check.name}`);
    if (check.fix) {
      needsNodeInstall.push(check);
    } else {
      needsSetup = true;
    }
  }
}

// Try to auto-fix Node dependencies
for (const item of needsNodeInstall) {
  console.log(`\n📦 Installing ${item.name}...`);
  try {
    item.fix();
  } catch (err) {
    console.error(`Failed to install ${item.name}`);
    process.exit(1);
  }
}

if (needsSetup) {
  console.log('\n' + '='.repeat(50));
  console.log('⚠️  Some dependencies are missing!');
  console.log('\nRun this command first:');
  console.log('\n  npm run setup\n');
  console.log('This will download Tika, JRE, Tesseract, and setup Python.');
  console.log('='.repeat(50) + '\n');
  process.exit(1);
}

console.log('✅ All dependencies ready!\n');
