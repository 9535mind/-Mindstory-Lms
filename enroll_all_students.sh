#!/bin/bash

# 각 학생 로그인 후 모든 강좌 수강 신청

students=("student1@example.com" "student2@example.com" "student3@example.com")
courses=(1 2 3 4 7)

for student in "${students[@]}"; do
  echo "=== $student 수강 신청 중 ==="
  
  # 로그인
  response=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$student\",\"password\":\"password123\"}")
  
  token=$(echo $response | jq -r '.data.session_token')
  
  if [ "$token" == "null" ]; then
    echo "❌ $student 로그인 실패"
    continue
  fi
  
  echo "✅ $student 로그인 성공 (토큰: ${token:0:20}...)"
  
  # 각 강좌 수강 신청
  for course_id in "${courses[@]}"; do
    enroll_response=$(curl -s -X POST "http://localhost:3000/api/enrollments" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "{\"course_id\":$course_id}")
    
    success=$(echo $enroll_response | jq -r '.success')
    
    if [ "$success" == "true" ]; then
      echo "  ✅ 강좌 $course_id 수강 신청 완료"
    else
      error=$(echo $enroll_response | jq -r '.error')
      echo "  ⚠️  강좌 $course_id: $error"
    fi
    
    sleep 0.5
  done
  
  echo ""
done

echo "=== 완료 ==="
