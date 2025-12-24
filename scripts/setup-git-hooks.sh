#!/bin/bash

# Setup git hooks for Frontend
# Run this script once to install the pre-push hook

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "🔧 Setting up git hooks for Frontend..."

# Create .git/hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Create pre-push hook
cat > "$GIT_HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
# Frontend pre-push hook
cd "$(git rev-parse --show-toplevel)"
./scripts/pre-push.sh
EOF

# Make it executable
chmod +x "$GIT_HOOKS_DIR/pre-push"
chmod +x "$PROJECT_ROOT/scripts/pre-push.sh"

echo "✅ Git hooks installed successfully!"
echo "📝 Pre-push hook will now run before every git push"
echo ""
echo "To test, try: git push"
echo "The hook will verify linting, type checking, and build before allowing the push."

