#!/bin/bash

# Script to install platform-specific native dependencies for @libsql/client
# Run this if you get "Cannot find module '@libsql/darwin-arm64'" errors

echo "Installing platform-specific @libsql native modules..."

cd "$(dirname "$0")/../netlify/functions"

# Detect platform
PLATFORM="$(uname -s)"
ARCH="$(uname -m)"

echo "Detected platform: $PLATFORM, architecture: $ARCH"

if [[ "$PLATFORM" == "Darwin" ]]; then
  if [[ "$ARCH" == "arm64" ]]; then
    echo "Installing @libsql/darwin-arm64..."
    npm install @libsql/darwin-arm64@^0.11.0 --save-optional
  else
    echo "Installing @libsql/darwin-x64..."
    npm install @libsql/darwin-x64@^0.11.0 --save-optional
  fi
elif [[ "$PLATFORM" == "Linux" ]]; then
  echo "Installing @libsql/linux-x64..."
  npm install @libsql/linux-x64@^0.11.0 --save-optional
elif [[ "$PLATFORM" == "MINGW"* ]] || [[ "$PLATFORM" == "MSYS"* ]] || [[ "$PLATFORM" == "CYGWIN"* ]]; then
  echo "Installing @libsql/win32-x64..."
  npm install @libsql/win32-x64@^0.11.0 --save-optional
else
  echo "Unknown platform: $PLATFORM"
  echo "Please install the appropriate @libsql package manually:"
  echo "  npm install @libsql/[platform]-[arch]@^0.11.0 --save-optional"
  exit 1
fi

echo "✅ Native dependencies installed!"
echo "Restart 'netlify dev' for changes to take effect."
