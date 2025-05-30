import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Mock fs functions
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('npm-install-hash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run npm install when no hash file exists', async () => {
    (existsSync as jest.Mock).mockImplementation((path: string) => {
      if (path === '.npm-install-hash') return false;
      if (path === 'package.json') return true;
      if (path === 'package-lock.json') return true;
      return false;
    });

    (readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path === 'package.json') return '{"dependencies": {"test": "1.0.0"}}';
      if (path === 'package-lock.json') return '{"lockfileVersion": 1}';
      return '';
    });

    // Mock process.argv
    const originalArgv = process.argv;
    process.argv = ['node', 'index.js', 'check'];

    // Import the module to run the main function
    await import('./index');

    expect(execSync).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });

    // Restore process.argv
    process.argv = originalArgv;
  });

  it('should not run npm install when hash matches', async () => {
    (existsSync as jest.Mock).mockImplementation((path: string) => {
      if (path === '.npm-install-hash') return true;
      if (path === 'package.json') return true;
      if (path === 'package-lock.json') return true;
      return false;
    });

    (readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path === '.npm-install-hash') return 'matching-hash';
      if (path === 'package.json') return '{"dependencies": {"test": "1.0.0"}}';
      if (path === 'package-lock.json') return '{"lockfileVersion": 1}';
      return '';
    });

    // Mock process.argv
    const originalArgv = process.argv;
    process.argv = ['node', 'index.js', 'check'];

    // Import the module to run the main function
    await import('./index');

    expect(execSync).not.toHaveBeenCalled();

    // Restore process.argv
    process.argv = originalArgv;
  });
}); 