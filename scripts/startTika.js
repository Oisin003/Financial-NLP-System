import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Allow overriding paths via environment variables
const jarPath = process.env.TIKA_JAR || 'E:\\tika-server-standard-3.2.3.jar';
const configPath = process.env.TIKA_CONFIG || 'E:\\Financial-NLP-System\\server\\tika-config.xml';

if (!existsSync(jarPath)) {
  console.error(`Tika JAR not found at: ${jarPath}`);
  console.error('Set TIKA_JAR env var or update the path in scripts/startTika.js');
  process.exit(1);
}

if (!existsSync(configPath)) {
  console.error(`Tika config not found at: ${configPath}`);
  console.error('Set TIKA_CONFIG env var or update the path in scripts/startTika.js');
  process.exit(1);
}

const tika = spawn('java', ['-jar', jarPath, '--config', configPath], {
  stdio: 'inherit'
});

tika.on('exit', (code) => {
  process.exit(code ?? 0);
});

//https://www.tutorialspoint.com/tika/tika_overview.htm