const { spawn } = require('child_process');
const { existsSync } = require('fs');

// Allow overriding paths via environment variables
const jarPath = process.env.TIKA_JAR || 'E:\\tika-server-standard-3.2.3.jar';
const tikaConfigPath = process.env.TIKA_CONFIG;
const serverConfigPath = process.env.TIKA_SERVER_CONFIG;
const tikaHost = process.env.TIKA_HOST;
const tikaPort = process.env.TIKA_PORT;

if (!existsSync(jarPath)) {
  console.error(`Tika JAR not found at: ${jarPath}`);
  console.error('Set TIKA_JAR env var or update the path in scripts/startTika.js');
  process.exit(1);
}

const args = ['-jar', jarPath];

if (tikaHost) {
  args.push('--host', tikaHost);
}

if (tikaPort) {
  args.push('--port', tikaPort);
}

if (serverConfigPath) {
  if (!existsSync(serverConfigPath)) {
    console.error(`Tika server config not found at: ${serverConfigPath}`);
    console.error('Set TIKA_SERVER_CONFIG env var or update the path in scripts/startTika.js');
    process.exit(1);
  }
  args.push('--config', serverConfigPath);
}

if (tikaConfigPath) {
  if (existsSync(tikaConfigPath)) {
    args.push('--tikaConfig', tikaConfigPath);
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