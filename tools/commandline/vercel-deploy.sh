#!/bin/bash
# =====================================================
# Vercel Production Deployment Script - SOTA (PranaKaia)
# =====================================================

set -e

echo "🚀 Starting Vercel Production Deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pre-deployment checks
echo -e "${BLUE}📋 Running pre-deployment checks...${NC}"

# Check if we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Must be on main branch to deploy to production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Branch check passed${NC}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git status clean${NC}"

# Step 2: Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
pnpm test:ci || {
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ All tests passed${NC}"

# Step 3: Lint check
echo -e "${BLUE}🔍 Running lint...${NC}"
pnpm lint || {
    echo -e "${RED}❌ Lint failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Lint passed${NC}"

# Step 4: Type check
echo -e "${BLUE}📝 Running type check...${NC}"
pnpm type-check || {
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Type check passed${NC}"

# Step 5: Build check
echo -e "${BLUE}🏗️  Running build check...${NC}"
pnpm build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful${NC}"

# Step 6: Security check
echo -e "${BLUE}🔒 Running security audit...${NC}"
pnpm audit --audit-level=high || {
    echo -e "${RED}⚠️  Security vulnerabilities found${NC}"
    # Don't exit, just warn
}
echo -e "${GREEN}✅ Security check complete${NC}"

# Step 7: Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel Production...${NC}"
vercel --prod --yes || {
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Deployment successful!${NC}"

# Step 8: Post-deployment verification
echo -e "${BLUE}🔍 Running post-deployment checks...${NC}"

# Wait for deployment to be ready
sleep 10

# Check if site is accessible
SITE_URL="https://pranakaia-store.vercel.app"
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$SITE_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Site is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}⚠️  Site returned HTTP $HTTP_CODE${NC}"
fi

# Step 9: Tag release
echo -e "${BLUE}🏷️  Creating release tag...${NC}"
VERSION=$(date +%Y.%m.%d-%H%M)
git tag -a "v$VERSION" -m "Production deployment $VERSION"
git push origin "v$VERSION"

echo -e "${GREEN}✅ Release tagged: v$VERSION${NC}"

# Success message
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 DEPLOYMENT SUCCESSFUL! 🎉${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "Site URL: ${BLUE}$SITE_URL${NC}"
echo -e "Version: ${BLUE}v$VERSION${NC}"
echo -e "Branch: ${BLUE}$BRANCH${NC}"
echo ""
echo -e "Next steps:"
echo "  1. Verify functionality at $SITE_URL"
echo "  2. Check Vercel Dashboard for metrics"
echo "  3. Monitor Sentry for errors"
echo "  4. Review Web Vitals in Speed Insights"
echo ""
