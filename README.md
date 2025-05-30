# npm-install-if-needed

A TypeScript utility that automatically runs `npm install` only when your package files have changed. Perfect for development workflows where you want to ensure dependencies are up to date without unnecessary reinstalls.

## Features

- Automatically runs `npm install` when package files change
- Tracks changes in `package.json`, `package-lock.json`, and patch files
- Skips `npm install` when no changes are detected
- Supports patch files in a `patches` directory

## Installation

```bash
npm install --save-dev npm-install-if-needed
```

## Usage

### 1. Add Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm-install-if-needed write",
    "dev": "npm-install-if-needed check; your-dev-command",
    "start": "npm-install-if-needed check; your-start-command"
  }
}
```

### 2. Add hash file to .gitignore

This tool calculates and writes a hash based on your `package.json` and related files to check if it needs to run `npm install` again. You should add it to your `.gitignore`:

```
.npm-install-hash
```

--- 

### Available Commands

The package provides two main commands:

- `npm-install-if-needed check`: Checks if packages need to be reinstalled
- `npm-install-if-needed write`: Writes the current package hash to file

### How It Works

1. The tool calculates a hash based on:
   - Contents of `package.json`
   - Contents of `package-lock.json`
   - Contents of all files in the `patches` directory (if it exists)

2. This hash is stored in a `.npm-install-hash` file

3. When you run your dev/start commands:
   - The tool recalculates the hash
   - Compares it with the stored hash
   - Only runs `npm install` if the hashes don't match

4. After `npm install` completes:
   - The tool updates the hash file with the new state

## Requirements

- Node.js 20.17.0 or higher
- TypeScript 5.5.4 or higher

## Development

To modify or contribute to this package:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes
4. Build the package:
   ```bash
   npm run build
   ```