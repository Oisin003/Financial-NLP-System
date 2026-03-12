import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const localTesseractDir = path.join(rootDir, 'runtimes', 'tesseract');

function hasLocalTesseract() {
  const candidates = [
    path.join(localTesseractDir, 'tesseract.exe'),
    path.join(localTesseractDir, 'bin', 'tesseract.exe'),
    path.join(localTesseractDir, 'Tesseract-OCR', 'tesseract.exe')
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

const checks = [
  {
    name: 'Node dependencies (root)',
    path: path.join(rootDir, 'node_modules', 'concurrently'),
    required: true,
    fix: () => execSync('npm install', { cwd: rootDir, stdio: 'inherit' })
  },
  {
    name: 'Node dependencies (server)',
    path: path.join(rootDir, 'server', 'node_modules'),
    required: true,
    fix: () => execSync('npm install', { cwd: path.join(rootDir, 'server'), stdio: 'inherit' })
  },
  {
    name: 'Node dependencies (client)',
    path: path.join(rootDir, 'client', 'node_modules'),
    required: true,
    fix: () => execSync('npm install', { cwd: path.join(rootDir, 'client'), stdio: 'inherit' })
  },
  {
    name: 'Apache Tika',
    path: path.join(rootDir, 'runtimes', 'tika', 'tika-server-standard-3.2.3.jar'),
    required: true,
    fix: null // Requires setup script
  },
  {
    name: 'Java Runtime (JRE)',
    path: path.join(rootDir, 'runtimes', 'jre', 'bin', 'java.exe'),
    required: true,
    fix: null
  },
  {
    name: 'Tesseract OCR',
    path: localTesseractDir,
    check: hasLocalTesseract,
    required: false,
    fix: null
  },
  {
    name: 'Python virtual environment',
    path: path.join(rootDir, 'nlp_service', 'venv', 'Scripts', 'python.exe'),
    required: true,
    fix: null
  }
];

let needsSetup = false;
let needsNodeInstall = [];

console.log('🔍 Checking dependencies...\n');

for (const check of checks) {
  const isPresent = check.check ? check.check() : existsSync(check.path);
  if (!isPresent) {
    const label = check.required === false ? 'Optional dependency missing' : 'Missing';
    console.log(`${label}: ${check.name}`);
    if (check.fix && check.required !== false) {
      needsNodeInstall.push(check);
    } else if (check.required !== false) {
      needsSetup = true;
    }
  }
}

// Try to auto-fix Node dependencies
for (const item of needsNodeInstall) {
  console.log(`\nInstalling ${item.name}...`);
  try {
    item.fix();
  } catch (err) {
    console.error(`Failed to install ${item.name}`);
    process.exit(1);
  }
}

if (needsSetup) {
  console.log('\nRunning setup for missing runtimes...\n');
  try {
    execSync('node scripts/setup.js', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.log('\n' + '='.repeat(50));
    console.log('Automatic setup failed.');
    console.log('\nRun this command manually:');
    console.log('\n  npm run setup\n');
    console.log('This will download Tika, JRE, Tesseract, and setup Python.');
    console.log('='.repeat(50) + '\n');
    process.exit(1);
  }

  // Validate again after setup to ensure npm start only continues when ready.
  const postSetupChecks = checks.filter((check) => !(check.fix) && check.required !== false);
  for (const check of postSetupChecks) {
    const isPresent = check.check ? check.check() : existsSync(check.path);
    if (!isPresent) {
      console.log('\n' + '='.repeat(50));
      console.log(`Still missing after setup: ${check.name}`);
      console.log('Run npm run setup and check installer output.');
      console.log('='.repeat(50) + '\n');
      process.exit(1);
    }
  }
}

console.log('All dependencies ready!\n');
