import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const chromePath = chromium.executablePath();

try {
  await access(chromePath);
} catch {
  throw new Error(
    'Chromium is not installed. Run "npx playwright install chromium" first.',
  );
}

const cliPath = path.join(
  process.cwd(),
  'node_modules',
  '@lhci',
  'cli',
  'src',
  'cli.js',
);

const pathKey =
  Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH';
const executableDirectory = path.dirname(process.execPath);
const childEnvironment = {
  ...process.env,
  CHROME_PATH: chromePath,
  [pathKey]: [
    executableDirectory,
    process.env[pathKey],
  ].filter(Boolean).join(path.delimiter),
};

const child = spawn(process.execPath, [cliPath, 'autorun'], {
  env: childEnvironment,
  stdio: 'inherit',
});

child.on('error', (error) => {
  throw error;
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
