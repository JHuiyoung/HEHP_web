document.addEventListener('DOMContentLoaded', () => {
    let port;
    let esptool;
    let logElement = document.getElementById('log');
    const updateFirmwareButton = document.getElementById('updateFirmware');

    const log = (message) => {
        if (logElement) {
            logElement.textContent += message + '\n';
        } else {
            console.error('logElement가 null입니다.');
        }
    };

    // GitHub에서 최신 릴리즈 정보를 받아와 펌웨어 옵션을 설정
    fetch('https://api.github.com/repos/JHuiyoung/HEHP_web/releases/latest')
        .then(response => response.json())
        .then(data => {
            const firmwareSelect = document.getElementById('firmwareSelect');
            data.assets.forEach(asset => {
                const option = document.createElement('option');
                option.value = asset.browser_download_url;
                option.text = asset.name;
                firmwareSelect.appendChild(option);
            });

            // 펌웨어 리스트 로딩이 완료된 후 버튼 활성화
            updateFirmwareButton.disabled = false;
        })
        .catch(error => {
            log('펌웨어 리스트 로딩 실패: ' + error.message);
        });

    updateFirmwareButton.addEventListener('click', () => {
        log('펌웨어 업데이트 버튼 클릭됨');
        const firmwareUrl = document.getElementById('firmwareSelect').value;

        if (!firmwareUrl) {
            log('펌웨어 URL이 선택되지 않음');
            return;
        }

        navigator.serial.requestPort()
            .then(selectedPort => {
                port = selectedPort;
                log('시리얼 포트 요청 성공');
                return port.open({ baudRate: 115200 });
            })
            .then(() => {
                log('시리얼 포트 열림');
                esptool = new ESPLoader(port);
                return esptool.initialize();
            })
            .then(() => {
                log('ESP32 초기화 완료');
                return fetch(firmwareUrl);
            })
            .then(firmwareResponse => {
                if (!firmwareResponse.ok) {
                    throw new Error('펌웨어 다운로드 실패');
                }
                log('펌웨어 다운로드 성공');
                return firmwareResponse.arrayBuffer();
            })
            .then(firmwareArrayBuffer => {
                const firmware = new Uint8Array(firmwareArrayBuffer);
                log('펌웨어 다운로드 완료, 플래싱 시작');
                return esptool.flashData(firmware, 0x1000);
            })
            .then(() => {
                log('펌웨어 업로드 완료');
            })
            .catch(error => {
                log('펌웨어 업로드 실패: ' + error.message);
            })
            .finally(() => {
                if (port && port.readable) {
                    port.close().then(() => {
                        log('디바이스 연결 해제됨');
                    }).catch(error => {
                        log('디바이스 연결 해제 실패: ' + error.message);
                    });
                }
            });
    });
});
