#!/bin/bash
# Emergency Pool Recovery Script
# Run this when pool is exhausted

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}🚨 EMERGENCY POOL RECOVERY SCRIPT${NC}"
echo -e "${RED}=================================${NC}"
echo ""

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:3000}"  # Override with env var
DATABASE="${DATABASE:-DPM_HELP68_FLOOD}"

echo -e "${YELLOW}1. Checking current health status...${NC}"
HEALTH1=$(curl -s "$SERVER_URL/api/health")
if [ $? -eq 0 ]; then
    STATUS=$(echo $HEALTH1 | jq -r '.status')
    PENDING=$(echo $HEALTH1 | jq -r '.poolStats.pendingRequests')
    AVAILABLE=$(echo $HEALTH1 | jq -r '.poolStats.availableConnections')
    
    echo -e "   Status: ${RED}$STATUS${NC}"
    echo -e "   Pending Requests: ${RED}$PENDING${NC}"
    echo -e "   Available Connections: ${YELLOW}$AVAILABLE${NC}"
else
    echo -e "   ${RED}❌ Cannot connect to server!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Clearing all cache to reduce load...${NC}"
CLEAR_RESULT=$(curl -s -X POST "$SERVER_URL/api/cache/clear?type=all")
if [ $? -eq 0 ]; then
    CLEARED=$(echo $CLEAR_RESULT | jq -r '.cleared.count')
    echo -e "   ${GREEN}✅ Cache cleared: $CLEARED entries${NC}"
else
    echo -e "   ${YELLOW}⚠️ Failed to clear cache${NC}"
fi

echo ""
echo -e "${YELLOW}3. Restarting pool for $DATABASE...${NC}"
RESTART_RESULT=$(curl -s -X POST "$SERVER_URL/api/pool/restart?database=$DATABASE")
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Pool restarted successfully${NC}"
else
    echo -e "   ${RED}❌ Failed to restart pool${NC}"
fi

echo ""
echo -e "${YELLOW}4. Waiting 5 seconds for recovery...${NC}"
sleep 5

echo ""
echo -e "${YELLOW}5. Checking health again...${NC}"
HEALTH2=$(curl -s "$SERVER_URL/api/health")
if [ $? -eq 0 ]; then
    STATUS2=$(echo $HEALTH2 | jq -r '.status')
    PENDING2=$(echo $HEALTH2 | jq -r '.poolStats.pendingRequests')
    AVAILABLE2=$(echo $HEALTH2 | jq -r '.poolStats.availableConnections')
    
    if [ "$STATUS2" == "critical" ]; then
        COLOR=$RED
    elif [ "$STATUS2" == "degraded" ]; then
        COLOR=$YELLOW
    else
        COLOR=$GREEN
    fi
    
    echo -e "   Status: ${COLOR}$STATUS2${NC}"
    echo -e "   Pending Requests: $PENDING2"
    echo -e "   Available Connections: $AVAILABLE2"
    
    if [ "$PENDING2" -lt "$PENDING" ]; then
        echo -e "   ${GREEN}✅ Situation improving!${NC}"
    else
        echo -e "   ${RED}⚠️ Still critical - may need application restart${NC}"
    fi
else
    echo -e "   ${RED}❌ Cannot connect to server!${NC}"
fi

echo ""
echo -e "${YELLOW}=================================${NC}"
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo -e "${CYAN}1. If still critical: docker-compose restart${NC}"
echo -e "${CYAN}2. Monitor: watch -n 3 'curl -s $SERVER_URL/api/health | jq .poolStats'${NC}"
echo -e "${CYAN}3. Check logs for slow queries${NC}"
echo -e "${CYAN}4. Consider optimizing queries or increasing pool size to 250+${NC}"
echo -e "${YELLOW}=================================${NC}"

