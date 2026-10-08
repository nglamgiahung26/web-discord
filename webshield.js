/**
 * WebShield Advanced - Giao diện bảo vệ website hiện đại
 * Tự động chặn chuột phải, phím tắt debug và hiển thị modal cảnh báo đẹp mắt.
 */
(function () {
    'use strict';

    // Chế độ Admin (thêm ?gateway=adminview vào URL để tắt tạm thời khi test)
    const ADMIN_KEY = "adminview";
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gateway') === ADMIN_KEY || localStorage.getItem('ws_admin') === 'true') {
        if (urlParams.get('gateway') === ADMIN_KEY) {
            localStorage.setItem('ws_admin', 'true');
        }
        return;
    }

    // 1. Chặn click chuột phải
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showWarning("Hành động này đã bị vô hiệu hóa để bảo vệ nội dung trang web!");
    });

    // 2. Chặn các phím tắt F12, Ctrl+Shift+I, Ctrl+U, v.v.
    document.addEventListener('keydown', function (e) {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
            showWarning("Các công cụ nhà phát triển đã bị khóa trên trang web này.");
        }
    });

    // 3. Tạo giao diện Modal Cảnh báo Đẹp Mắt
    function createWarningModal() {
        if (document.getElementById('webshield-modal')) return;

        const modalHTML = `
            <div id="webshield-modal" style="
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(10, 10, 15, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Outfit', sans-serif;
                opacity: 0;
                transition: opacity 0.3s ease;
            ">
                <div style="
                    background: #181825;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
                    transform: translateY(20px);
                    transition: transform 0.3s ease;
                " id="webshield-modal-box">
                    <div style="
                        width: 60px; height: 60px;
                        background: rgba(243, 139, 168, 0.15);
                        color: #f38ba8;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        margin: 0 auto 20px auto;
                    ">🛡️</div>
                    <h2 style="color: #cdd6f4; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">Khu vực được bảo vệ</h2>
                    <p id="webshield-message" style="color: #a6adc8; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">Phát hiện hành động không được phép trên hệ thống.</p>
                    <button id="webshield-close-btn" style="
                        background: #89b4fa;
                        color: #11111b;
                        border: none;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        border-radius: 8px;
                        cursor: pointer;
                        width: 100%;
                        transition: background 0.2s;
                    ">Đã hiểu</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setTimeout(() => {
            document.getElementById('webshield-modal').style.opacity = '1';
            document.getElementById('webshield-modal-box').style.transform = 'translateY(0)';
        }, 10);

        document.getElementById('webshield-close-btn').addEventListener('click', hideWarning);
    }

    function showWarning(message) {
        createWarningModal();
        const msgEl = document.getElementById('webshield-message');
        if (msgEl) msgEl.innerText = message;
        
        const modal = document.getElementById('webshield-modal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.opacity = '1';
                document.getElementById('webshield-modal-box').style.transform = 'translateY(0)';
            }, 10);
        }
    }

    function hideWarning() {
        const modal = document.getElementById('webshield-modal');
        if (modal) {
            modal.style.opacity = '0';
            document.getElementById('webshield-modal-box').style.transform = 'translateY(20px)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // 4. Phát hiện DevTools mở qua kích thước cửa sổ
    setInterval(function () {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
            showWarning("Hệ thống phát hiện bạn đang mở bảng điều khiển (DevTools). Trang web đã được che chắn.");
        }
    }, 1000);

})();
