/**
 * Cloudflare Stream 커스텀 플레이어 (보안 강화형)
 * - Signed URL 자동 갱신
 * - 동적 워터마크
 * - 배속 조절
 * - 이어보기 기능
 * - 우클릭/복사/공유 차단
 */

class CloudflareStreamPlayer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.videoId = options.videoId;
    this.userId = options.userId;
    this.userName = options.userName;
    this.courseId = options.courseId;
    this.lessonId = options.lessonId;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    
    this.player = null;
    this.signedUrl = null;
    this.expiresAt = null;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    
    this.init();
  }

  async init() {
    try {
      // 1. Signed URL 가져오기
      await this.getSignedUrl();
      
      // 2. 플레이어 생성
      await this.createPlayer();
      
      // 3. 워터마크 추가
      this.addWatermark();
      
      // 4. 보안 설정 적용
      this.applySecuritySettings();
      
      // 5. 이어보기 위치 복원
      this.restoreProgress();
      
      // 6. URL 자동 갱신 타이머 시작
      this.startUrlRefreshTimer();
      
      console.log('✅ Cloudflare Stream 플레이어 초기화 완료');
    } catch (error) {
      console.error('❌ 플레이어 초기화 실패:', error);
      this.showError('영상을 불러올 수 없습니다.');
    }
  }

  async getSignedUrl() {
    try {
      const response = await axios.post('/api/stream/signed-url', {
        videoId: this.videoId,
        userId: this.userId,
        userName: this.userName
      });

      if (response.data.success) {
        this.signedUrl = response.data.signedUrl;
        this.expiresAt = response.data.expiresAt;
        
        if (response.data.demo) {
          console.warn('⚠️ 데모 모드: Signed URL이 아닌 일반 URL을 사용합니다.');
        }
      } else {
        throw new Error('Signed URL 생성 실패');
      }
    } catch (error) {
      console.error('❌ Signed URL 가져오기 실패:', error);
      throw error;
    }
  }

  async createPlayer() {
    // Cloudflare Stream Player SDK 로드
    if (!window.Stream) {
      await this.loadStreamSDK();
    }

    // 플레이어 컨테이너 생성
    this.container.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <iframe
          id="streamPlayer"
          src="https://customer-2e8c2335c9dc802347fb23b9d608d4f4.cloudflarestream.com/${this.videoId}/iframe?preload=true&poster=https://customer-2e8c2335c9dc802347fb23b9d608d4f4.cloudflarestream.com/${this.videoId}/thumbnails/thumbnail.jpg"
          style="border: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowfullscreen="true"
        ></iframe>
        <div id="watermark" class="watermark"></div>
      </div>
    `;

    this.player = window.Stream(document.getElementById('streamPlayer'));

    // 이벤트 리스너 등록
    this.player.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('▶️ 재생 시작');
    });

    this.player.addEventListener('pause', () => {
      this.isPlaying = false;
      console.log('⏸️ 일시정지');
    });

    this.player.addEventListener('timeupdate', (e) => {
      this.currentTime = e.detail.currentTime;
      this.saveProgress();
    });

    this.player.addEventListener('loadedmetadata', (e) => {
      this.duration = e.detail.duration;
      console.log(`📹 영상 길이: ${Math.floor(this.duration / 60)}분 ${Math.floor(this.duration % 60)}초`);
    });

    this.player.addEventListener('ended', () => {
      console.log('✅ 재생 완료');
      this.onComplete();
    });
  }

  async loadStreamSDK() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  addWatermark() {
    const watermark = document.getElementById('watermark');
    if (!watermark) return;

    // 동적 워터마크 생성
    const watermarkText = `${this.userName} (ID: ${this.userId})`;
    
    watermark.innerHTML = `
      <div class="watermark-text">${watermarkText}</div>
    `;

    // CSS 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
      .watermark {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        font-family: 'Malgun Gothic', sans-serif;
        pointer-events: none;
        z-index: 1000;
        animation: watermarkFloat 10s infinite linear;
      }

      @keyframes watermarkFloat {
        0% {
          top: 10px;
          right: 10px;
        }
        25% {
          top: 10px;
          right: calc(100% - 200px);
        }
        50% {
          top: calc(100% - 40px);
          right: calc(100% - 200px);
        }
        75% {
          top: calc(100% - 40px);
          right: 10px;
        }
        100% {
          top: 10px;
          right: 10px;
        }
      }

      .watermark-text {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }
    `;
    document.head.appendChild(style);

    console.log('🏷️ 워터마크 추가 완료:', watermarkText);
  }

  applySecuritySettings() {
    // IFrame 우클릭 차단
    const iframe = document.getElementById('streamPlayer');
    if (iframe) {
      iframe.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        alert('🚫 우클릭이 차단되었습니다.');
      });
    }

    // 컨테이너 보호
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.container.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    console.log('🔒 보안 설정 적용 완료');
  }

  saveProgress() {
    if (!this.lessonId || this.currentTime <= 0) return;

    // 로컬 스토리지에 진도 저장
    const key = `progress_${this.courseId}_${this.lessonId}`;
    localStorage.setItem(key, JSON.stringify({
      currentTime: this.currentTime,
      duration: this.duration,
      timestamp: Date.now()
    }));

    // 서버에 진도율 전송 (5초마다)
    if (Math.floor(this.currentTime) % 5 === 0) {
      const progress = Math.floor((this.currentTime / this.duration) * 100);
      this.onProgress(progress, this.currentTime, this.duration);
    }
  }

  restoreProgress() {
    if (!this.lessonId) return;

    const key = `progress_${this.courseId}_${this.lessonId}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      const data = JSON.parse(saved);
      
      // 24시간 이내 데이터만 복원
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        this.player.currentTime = data.currentTime;
        console.log(`⏩ 이어보기: ${Math.floor(data.currentTime)}초부터 재생`);
      }
    }
  }

  startUrlRefreshTimer() {
    // URL이 만료되기 5분 전에 갱신
    if (!this.expiresAt) return;

    const refreshTime = (this.expiresAt * 1000) - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      setTimeout(async () => {
        console.log('🔄 Signed URL 갱신 중...');
        await this.getSignedUrl();
        this.startUrlRefreshTimer();
      }, refreshTime);
    }
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
      </div>
    `;
  }

  // 배속 조절
  setPlaybackRate(rate) {
    if (this.player) {
      this.player.playbackRate = rate;
      console.log(`⚡ 배속 변경: ${rate}x`);
    }
  }

  // 재생/일시정지
  togglePlay() {
    if (this.player) {
      if (this.isPlaying) {
        this.player.pause();
      } else {
        this.player.play();
      }
    }
  }

  // 플레이어 제거
  destroy() {
    if (this.player) {
      this.player = null;
    }
    this.container.innerHTML = '';
  }
}

// 전역으로 노출
window.CloudflareStreamPlayer = CloudflareStreamPlayer;
