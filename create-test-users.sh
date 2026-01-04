#!/bin/bash

echo "🔧 테스트 계정 생성 중..."

# 관리자 계정 생성
echo "1. 관리자 계정 생성..."
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.kr",
    "password": "admin123456",
    "name": "관리자"
  }' > /dev/null

# 관리자 권한 부여
npx wrangler d1 execute mindstory-production --local --command="UPDATE users SET role = 'admin' WHERE email = 'admin@lms.kr';" > /dev/null 2>&1

echo "✅ 관리자 계정 생성 완료!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 이메일: admin@lms.kr"
echo "🔑 비밀번호: admin123456"
echo "👤 권한: 관리자"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
