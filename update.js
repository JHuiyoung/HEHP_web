let logElement = document.getElementById('log');

const log = (message) => {
    logElement.textContent += message + '\n';
};

// 펌웨어 설치 진행 상황 로그
document.querySelector('esp-web-install-button').addEventListener('install-progress', (event) => {
    log(`진행 상황: ${event.detail}`);
});

// 펌웨어 설치 완료 로그
document.querySelector('esp-web-install-button').addEventListener('install-complete', () => {
    log('펌웨어 설치가 완료되었습니다!');
});

// 펌웨어 설치 실패 로그
document.querySelector('esp-web-install-button').addEventListener('install-error', (event) => {
    log(`펌웨어 설치 실패: ${event.detail}`);
});
