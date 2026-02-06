const { spawn } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const path = require('path');

// Allow overriding paths via environment variables
const jarPath = process.env.TIKA_JAR || 'E:\\tika-server-standard-3.2.3.jar';
const defaultTikaConfigPath = path.join(__dirname, '..', 'server', 'tika-config.xml');
const tikaConfigPath = process.env.TIKA_CONFIG || (existsSync(defaultTikaConfigPath) ? defaultTikaConfigPath : undefined);
const tikaHost = process.env.TIKA_HOST;
const tikaPort = process.env.TIKA_PORT;

if (!existsSync(jarPath)) {
  console.error(`Tika JAR not found at: ${jarPath}`);
  console.error('Set TIKA_JAR env var or update the path in scripts/startTika.js');
  process.exit(1);
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

const tika = spawn('java', args, {
  stdio: 'inherit'
});

tika.on('exit', (code) => {
  process.exit(code ?? 0);
});

//https://www.tutorialspoint.com/tika/tika_overview.htm