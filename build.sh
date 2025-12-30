#!/bin/bash
# 빌드 후 처리 스크립트 - uploads 폴더와 _routes.json 자동 복사

echo "📁 uploads 폴더 복사 중..."
if [ -d "public/uploads" ]; then
  cp -r public/uploads dist/
  echo "✅ uploads 폴더 복사 완료"
else
  echo "⚠️  public/uploads 폴더가 없습니다"
fi

echo "📝 _routes.json 생성 중..."
cat > dist/_routes.json << 'ROUTES'
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/uploads/*", "/static/*"]
}
ROUTES
echo "✅ _routes.json 생성 완료"

echo "✨ 빌드 완료!"
