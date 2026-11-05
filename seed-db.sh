#!/usr/bin/env bash

# ==============================================================================
# SkillBridge – Automated Database Seeding & Initialization Script
# ==============================================================================
# Usage:
#   ./seed-db.sh
#
# This script waits for the Docker MongoDB & Backend containers to be ready,
# then populates all default authentications, 28 university courses,
# 8 faculty mentors, cohort assessments, and placement drives.
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  SkillBridge Automated Database Initializer Script    ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker daemon is not running. Please start Docker and retry.${NC}"
    exit 1
fi

# 2. Check if skillbridge-backend container exists
if [ ! "$(docker ps -q -f name=skillbridge-backend)" ]; then
    echo -e "${YELLOW}Notice: 'skillbridge-backend' container is not running.${NC}"
    echo -e "${BLUE}Starting Docker Compose containers...${NC}"
    docker-compose up -d
fi

echo -e "${YELLOW}Waiting for backend and MongoDB containers to be healthy...${NC}"

# Wait up to 30 seconds for health check to pass
RETRIES=15
until curl -s http://localhost:5000/api/health > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo -e "Waiting for backend API on port 5000... ($RETRIES retries left)"
    sleep 2
    RETRIES=$((RETRIES-1))
done

if [ $RETRIES -eq 0 ]; then
    echo -e "${RED}Error: Backend service timed out on http://localhost:5000/api/health.${NC}"
    echo -e "Inspect logs with: docker logs skillbridge-backend"
    exit 1
fi

echo -e "${GREEN}✔ Backend and MongoDB services are healthy.${NC}"
echo -e "${BLUE}Executing database seeder inside 'skillbridge-backend' container...${NC}\n"

# Run the seeding script inside the container
docker exec -i skillbridge-backend node src/seed.js

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}✔ SkillBridge Database Initialization Complete!      ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Open your browser to: ${BLUE}http://localhost:3000${NC}"
echo -e "\nDefault 1-Click Dev Logins:"
echo -e "  • Student:        ${YELLOW}aditya@example.com${NC} / ${YELLOW}password123${NC}"
echo -e "  • Faculty Mentor: ${YELLOW}thorne@faculty.edu${NC} / ${YELLOW}password123${NC}"
echo -e "  • Administrator:  ${YELLOW}vance@faculty.edu${NC}  / ${YELLOW}password123${NC}\n"
