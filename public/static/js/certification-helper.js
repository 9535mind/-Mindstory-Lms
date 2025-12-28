/**
 * 민간자격 연계 헬퍼
 * 수료 완료 시 자격 안내 팝업 표시
 */

// 수료 완료 시 호출되는 함수
async function showCertificationGuide(courseId) {
  try {
    // 해당 강좌와 연결된 민간자격 조회
    const response = await apiRequest('GET', `/api/certifications/types`);
    
    if (!response.success) {
      console.error('Failed to load certification types');
      return;
    }

    const certifications = response.data;
    
    // 현재 강좌와 연결된 자격 필터링
    const relevantCerts = [];
    
    for (const cert of certifications) {
      const detailResponse = await apiRequest('GET', `/api/certifications/types/${cert.id}`);
      if (detailResponse.success) {
        const courses = detailResponse.data.courses || [];
        const hasThisCourse = courses.some(c => c.id === courseId);
        
        if (hasThisCourse) {
          relevantCerts.push({
            ...cert,
            courses: courses
          });
        }
      }
    }

    if (relevantCerts.length === 0) {
      return; // 연결된 자격이 없으면 팝업 표시 안 함
    }

    // 팝업 생성
    createCertificationModal(relevantCerts);

  } catch (error) {
    console.error('Show certification guide error:', error);
  }
}

// 민간자격 안내 모달 생성
function createCertificationModal(certifications) {
  // 기존 모달 제거
  const existingModal = document.getElementById('cert-guide-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'cert-guide-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  const certsHTML = certifications.map(cert => `
    <div class="border rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer" onclick="viewCertification(${cert.id})">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h4 class="text-xl font-bold text-gray-800 mb-2">${cert.name}</h4>
          <p class="text-sm text-purple-600 mb-2">
            <i class="fas fa-certificate mr-1"></i>${cert.code}
          </p>
        </div>
        ${cert.price > 0 ? `
          <div class="text-right">
            <p class="text-sm text-gray-500">발급 비용</p>
            <p class="text-lg font-bold text-green-600">${cert.price.toLocaleString()}원</p>
          </div>
        ` : `
          <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            무료
          </div>
        `}
      </div>
      
      <p class="text-gray-600 text-sm mb-4">${cert.description || ''}</p>
      
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          <i class="fas fa-building mr-1"></i>${cert.issuer_name}
        </div>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
          신청하기 <i class="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- 헤더 -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-white bg-opacity-20 rounded-full p-3 mr-4">
              <i class="fas fa-trophy text-3xl"></i>
            </div>
            <div>
              <h2 class="text-2xl font-bold mb-1">🎉 수료를 축하드립니다!</h2>
              <p class="text-purple-100">이제 민간자격 취득으로 전문성을 인정받으세요</p>
            </div>
          </div>
          <button onclick="closeCertificationModal()" class="text-white hover:text-gray-200">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
      </div>

      <!-- 안내 메시지 -->
      <div class="p-6 bg-purple-50 border-b">
        <div class="flex items-start">
          <div class="bg-purple-100 rounded-full p-2 mr-3">
            <i class="fas fa-info-circle text-purple-600"></i>
          </div>
          <div class="flex-1">
            <p class="text-gray-700">
              수료하신 과정과 연계된 <strong class="text-purple-600">민간자격</strong>이 있습니다.<br>
              전문가로서의 역량을 공식적으로 인정받고, 활동 범위를 넓혀보세요!
            </p>
          </div>
        </div>
      </div>

      <!-- 자격 목록 -->
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          <i class="fas fa-award mr-2 text-yellow-500"></i>신청 가능한 민간자격
        </h3>
        <div class="space-y-4">
          ${certsHTML}
        </div>
      </div>

      <!-- 푸터 -->
      <div class="p-6 bg-gray-50 border-t">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <i class="fas fa-lightbulb mr-1 text-yellow-500"></i>
            Tip: 민간자격은 나중에도 신청할 수 있습니다
          </div>
          <div class="space-x-3">
            <button onclick="closeCertificationModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-100">
              나중에 하기
            </button>
            <button onclick="goToCertificationPage()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              자격 더 알아보기
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// 모달 닫기
function closeCertificationModal() {
  const modal = document.getElementById('cert-guide-modal');
  if (modal) {
    modal.remove();
  }
}

// 특정 자격 상세 보기
async function viewCertification(certId) {
  window.location.href = `/certification/${certId}`;
}

// 자격 페이지로 이동
function goToCertificationPage() {
  window.location.href = '/certifications';
}

// 전역 함수로 노출
window.showCertificationGuide = showCertificationGuide;
window.closeCertificationModal = closeCertificationModal;
window.viewCertification = viewCertification;
window.goToCertificationPage = goToCertificationPage;
