#!/bin/bash
set -e

# ── Beta Release Script ──
# Creates a GitHub prerelease for testing auto-update flow.
# Beta versions use semver prerelease tags (e.g. 1.0.5-beta.1).
# Stable users never see these — only builds already on a prerelease
# version will auto-update to the next beta.
#
# Usage:
#   1. Set version in package.json to e.g. "1.0.5-beta.1"
#   2. Run: npm run release:beta
#   3. Install the DMG manually for the first beta
#   4. Subsequent betas auto-update from the previous beta

# ── Verify Environment ──

if [ -z "$APPLE_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ] || [ -z "$APPLE_TEAM_ID" ]; then
  echo "Error: Missing signing environment variables."
  echo "Required: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID"
  echo "Add these to your ~/.zshrc or ~/.zprofile"
  exit 1
fi

if ! command -v gh &> /dev/null; then
  echo "Error: gh CLI is required. Install with: brew install gh"
  exit 1
fi

# ── Get Version ──

VERSION=$(node -p "require('./package.json').version")

# Verify this is actually a prerelease version
if [[ ! "$VERSION" == *"-"* ]]; then
  echo "Error: Version '${VERSION}' is not a prerelease."
  echo "Set version in package.json to e.g. '1.0.5-beta.1' first."
  exit 1
fi

echo "Releasing beta v${VERSION}..."

# ── Build ──

echo "Building renderer..."
npm run build:renderer

echo "Building Electron app (signing + notarization)..."
npx electron-builder --config electron-builder.config.js --publish never

# ── Git Tag ──

echo "Creating git tag..."
git tag "v${VERSION}"
git push origin main --tags

# ── GitHub Prerelease ──

echo "Creating GitHub prerelease..."

NOTES="Beta release v${VERSION} — testing build, not for general use."

# Find built artifacts
DMG_FILE=$(find dist -maxdepth 1 -name "*${VERSION}*.dmg" -print -quit)
ZIP_FILE=$(find dist -maxdepth 1 -name "*${VERSION}*.zip" -print -quit)
YML_FILE="dist/latest-mac.yml"

RELEASE_ARGS=()
[ -n "$DMG_FILE" ] && RELEASE_ARGS+=("$DMG_FILE")
[ -n "$ZIP_FILE" ] && RELEASE_ARGS+=("$ZIP_FILE")
[ -f "$YML_FILE" ] && RELEASE_ARGS+=("$YML_FILE")

gh release create "v${VERSION}" \
  --title "v${VERSION} (beta)" \
  --notes "$NOTES" \
  --prerelease \
  "${RELEASE_ARGS[@]}"

echo "Beta release v${VERSION} complete!"
echo "Install the DMG manually to start testing auto-updates."
