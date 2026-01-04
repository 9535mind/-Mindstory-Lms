#!/bin/bash

##############################################
# LMS 테스트 자동화 스크립트
# 목적: 배포 전 자동으로 모든 엔드포인트를 테스트
# 사용법: bash test-automation.sh [BASE_URL]
##############################################

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 기본 URL 설정
BASE_URL="${1:-http://localhost:3000}"

# 테스트 결과 카운터
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "======================================"
echo "🧪 LMS 자동 테스트 시작"
echo "🌐 테스트 URL: $BASE_URL"
echo "======================================"
echo ""

# 헬퍼 함수: HTTP 상태 코드 테스트
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "[$TOTAL_TESTS] $description ... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" 2>/dev/null)
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 헬퍼 함수: JSON 응답 검증
test_json_response() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_key=$4
    local data=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "[$TOTAL_TESTS] $description ... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -X GET "$BASE_URL$endpoint" 2>/dev/null)
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    # jq가 없으면 grep으로 대체
    if command -v jq &> /dev/null; then
        if echo "$response" | jq -e ".$expected_key" &> /dev/null; then
            echo -e "${GREEN}✓ PASS${NC} (JSON key '$expected_key' exists)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${RED}✗ FAIL${NC} (JSON key '$expected_key' not found)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        if echo "$response" | grep -q "\"$expected_key\""; then
            echo -e "${GREEN}✓ PASS${NC} (Key '$expected_key' found)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${RED}✗ FAIL${NC} (Key '$expected_key' not found)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    fi
}

echo "📍 Phase 1: 기본 엔드포인트 테스트"
echo "======================================"

# 1. 홈페이지
test_endpoint "GET" "/" "200" "홈페이지 로드"

# 2. 강좌 목록 페이지
test_endpoint "GET" "/courses" "200" "강좌 목록 페이지"

# 3. 로그인 페이지
test_endpoint "GET" "/login" "200" "로그인 페이지"

# 4. 회원가입 페이지
test_endpoint "GET" "/register" "200" "회원가입 페이지"

# 5. 관리자 로그인 페이지
test_endpoint "GET" "/admin/login" "200" "관리자 로그인 페이지"

echo ""
echo "📍 Phase 2: API 엔드포인트 테스트"
echo "======================================"

# 6. 강좌 목록 API (인증 없이)
test_json_response "GET" "/api/courses" "강좌 목록 API" "success"

# 7. 회원가입 API (잘못된 데이터)
test_endpoint "POST" "/api/auth/register" "400" "회원가입 API - 빈 데이터" '{}'

# 8. 로그인 API (잘못된 데이터)
test_endpoint "POST" "/api/auth/login" "401" "로그인 API - 잘못된 자격증명" '{"email":"wrong@test.com","password":"wrong"}'

# 9. 관리자 대시보드 (인증 필요 - 401 예상)
test_endpoint "GET" "/api/admin/dashboard" "401" "관리자 대시보드 - 인증 없음"

echo ""
echo "📍 Phase 3: 정적 파일 테스트"
echo "======================================"

# 10. CSS 파일
test_endpoint "GET" "/static/style.css" "200" "CSS 파일 로드"

# 11. JavaScript 파일
test_endpoint "GET" "/static/js/auth.js" "200" "auth.js 로드"
test_endpoint "GET" "/static/js/utils.js" "200" "utils.js 로드"

echo ""
echo "======================================"
echo "📊 테스트 결과 요약"
echo "======================================"
echo -e "총 테스트: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "성공: ${GREEN}$PASSED_TESTS${NC}"
echo -e "실패: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 모든 테스트를 통과했습니다!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ 일부 테스트가 실패했습니다.${NC}"
    exit 1
fi
