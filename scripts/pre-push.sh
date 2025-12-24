#!/bin/bash

# Pre-push hook for Frontend
# This script runs before git push and verifies linting and build

set -e  # Exit on any error

echo "🔍 Running pre-push checks for Frontend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found. Are you in the frontend directory?${NC}"
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
  npm install
fi

# Run linter
echo -e "${GREEN}📝 Running ESLint...${NC}"
if ! npm run lint; then
  echo -e "${RED}❌ ESLint failed! Please fix linting errors before pushing.${NC}"
  exit 1
fi

# Run type check
echo -e "${GREEN}🔎 Running TypeScript type check...${NC}"
if ! npm run type-check; then
  echo -e "${RED}❌ TypeScript type check failed! Please fix type errors before pushing.${NC}"
  exit 1
fi

# Run build
echo -e "${GREEN}🏗️  Building project...${NC}"
if ! npm run build; then
  echo -e "${RED}❌ Build failed! Please fix build errors before pushing.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ All pre-push checks passed!${NC}"
exit 0

