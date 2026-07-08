#!/bin/bash

# 🧹 Repository Cleanup Script
# Run this periodically to keep the repo clean

set -e

echo "🧹 Starting repository cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Clean build artifacts
echo "📦 Cleaning build artifacts..."
find . -type f -name "*.tsbuildinfo" -delete 2>/dev/null && print_status "Removed *.tsbuildinfo files"
find . -type d -name ".turbo" -exec rm -rf {} + 2>/dev/null && print_status "Removed .turbo directories"
find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null && print_status "Removed dist directories"
find . -type d -name "build" -exec rm -rf {} + 2>/dev/null && print_status "Removed build directories"

# 2. Clean test artifacts
echo "🧪 Cleaning test artifacts..."
find . -type f -name "test_output.txt" -delete 2>/dev/null && print_status "Removed test_output.txt"
find . -type f -name "test-output.txt" -delete 2>/dev/null && print_status "Removed test-output.txt"
find . -type f -name "vitest-output.txt" -delete 2>/dev/null && print_status "Removed vitest-output.txt"
find . -type d -name "coverage" -exec rm -rf {} + 2>/dev/null && print_status "Removed coverage directories"

# 3. Clean temp files
echo "🗑️ Cleaning temporary files..."
find . -type f -name "*.tmp" -delete 2>/dev/null && print_status "Removed *.tmp files"
find . -type f -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null && print_status "Removed *.log files"

# 4. Clean package manager artifacts (except node_modules)
echo "📥 Cleaning package manager artifacts..."
rm -f pnpm-lock.yaml.bak 2>/dev/null && print_status "Removed pnpm-lock backups"

# 5. Check for large files
echo "📊 Checking for large files..."
LARGE_FILES=$(find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.pnpm-store/*" 2>/dev/null)
if [ -n "$LARGE_FILES" ]; then
    print_warning "Large files found (>1MB):"
    echo "$LARGE_FILES"
else
    print_status "No large files found"
fi

# 6. Check for unused dependencies
echo "🔍 Checking for unused dependencies..."
if command -v knip &> /dev/null; then
    knip --no-exit-code 2>/dev/null && print_status "Knip analysis complete"
else
    print_warning "Knip not installed, skipping unused dependency check"
fi

# 7. Git garbage collection
echo "🗄️ Running git garbage collection..."
git gc --aggressive --prune=now 2>/dev/null && print_status "Git GC complete"

# 8. Show disk usage
echo ""
echo "📈 Disk usage:"
du -sh . 2>/dev/null || echo "Unable to calculate disk usage"

echo ""
echo -e "${GREEN}✨ Repository cleanup complete!${NC}"
