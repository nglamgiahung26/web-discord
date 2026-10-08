/*!------------------------------------------------------------------
 * Cách dùng: thêm cái này vào <head> của trang web:
 *
 *   <script src="webshield.js"></script>
 *  
 * cách xem DEVTOOL
 *   Cách 1: gõ chữ "adminview" ở bất kỳ đâu trên trang (KHÔNG gõ trong ô
 *           nhập liệu) → bộ chặn tắt ngay, gõ lần nữa để bật lại.
 *   Cách 2: thêm ?ws-admin=adminview vào URL → tắt vĩnh viễn trên trình
 *           duyệt
 *
 * ------------------------------------------------------------------
 */
; (function () {
  'use strict'

  // ---------- Cấu hình mặc định ----------
  var config = {
    blockRightClick: true,
    blockShortcuts: true,
    consoleWarning: true,
    detectDevtools: true,
    blockSelect: false,
    blockDrag: false,
    adminPassphrase: 'adminview', // Ông chỉnh mật khẩu mở DEV TOOL ở đây
    onViolation: null,
    checkIntervalMs: 900
  }

  if (typeof window.WebShieldConfig === 'object' && window.WebShieldConfig !== null) {
    for (var k in window.WebShieldConfig) {
      if (Object.prototype.hasOwnProperty.call(window.WebShieldConfig, k)) {
        config[k] = window.WebShieldConfig[k]
      }
    }
  }

  var ADMIN_KEY = 'webshield-admin'
  var adminMode = false
  var keyBuffer = ''

  function normalizePassphrase(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  function report(kind) {
    try {
      if (typeof config.onViolation === 'function') config.onViolation(kind)
    } catch (e) { /* im lặng */ }
  }

  function toast(msg) {
    function show() {
      var el = document.createElement('div')
      el.textContent = msg
      el.style.cssText =
        'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
        'z-index:2147483647;background:#064e3b;color:#ecfdf5;' +
        'padding:10px 18px;border-radius:10px;font:600 13px system-ui,sans-serif;' +
        'box-shadow:0 8px 24px rgba(0,0,0,0.25);opacity:0;transition:opacity 0.3s'
      document.body.appendChild(el)
      requestAnimationFrame(function () { el.style.opacity = '1' })
      setTimeout(function () {
        el.style.opacity = '0'
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el) }, 350)
      }, 2800)
    }
    if (document.body) show()
    else document.addEventListener('DOMContentLoaded', show)
  }

  // ---------- DEVTOOL SETTING ----------
  function isAdminStored() {
    try { return localStorage.getItem(ADMIN_KEY) === '1' } catch (e) { return false }
  }

  function setAdmin(on, quiet) {
    try {
      if (on) localStorage.setItem(ADMIN_KEY, '1')
      else localStorage.removeItem(ADMIN_KEY)
    } catch (e) { }

    adminMode = on

    if (on) {
      removeOverlay()
      document.documentElement.style.overflow = ''
    }

    if (!quiet) {
      toast(on
        ? '🛡️ WebShield: chế độ ADMIN BẬT'
        : '🛡️ WebShield: chế độ ADMIN TẮT')
      console.info(
        '%c[WebShield] Chế độ admin: ' + (on ? 'BẬT — F12/DevTools không bị chặn' : 'TẮT'),
        on ? 'color:#059669;font-weight:700' : 'color:#b45309'
      )
    }
  }

  ; (function checkUrlParam() {
    try {
      var raw = new URLSearchParams(window.location.search).get('window.gateway.login.ws.admin')
      if (raw === null) return
      if (raw === 'off') { setAdmin(false); return }
      if (config.adminPassphrase && normalizePassphrase(raw) === normalizePassphrase(config.adminPassphrase)) {
        setAdmin(true)
      }
    } catch (e) { }
  })()

  if (!adminMode && isAdminStored()) adminMode = true

  if (config.consoleWarning) {
    console.log(
      '%cDỪNG LẠI!',
      'color:#dc2626;font-size:30px;font-weight:700;text-shadow:0 1px 1px rgba(0,0,0,0.25);'
    )
    console.log(
      '%cNếu ai đó bảo bạn dán (paste) code vào đây để "nhận thưởng", "mở khóa skin", "kiểm tra tài khoản"… thì đó là LỪA ĐẢO.',
      'color:#dc2626;font-size:13px;font-weight:600;'
    )
    console.log(
      '%cMã nguồn giao diện luôn được tải về trình duyệt — đúng với mọi website. Mật khẩu/key an toàn phải nằm trên SERVER.',
      'color:#737373;font-size:12px;'
    )
    if (adminMode) {
      console.info('%c[WebShield] Admin mode đang BẬT trên trình duyệt này (localStorage) — DevTools không bị chặn.', 'color:#059669;font-weight:700')
    }
  }

  if (config.blockRightClick) {
    document.addEventListener('contextmenu', function (e) {
      if (adminMode) return
      e.preventDefault()
      report('contextmenu')
      return false
    })
  }

  document.addEventListener('keydown', function (e) {
    // 3a) Cheat code: gõ passphrase liên tục (không tính khi đang gõ trong ô nhập)
    if (config.adminPassphrase && e.key && e.key.length === 1) {
      var target = e.target
      var inField = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable === true
      )

      if (!inField && /^[a-zA-Z0-9]$/.test(e.key)) {
        keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-40)
        var phrase = normalizePassphrase(config.adminPassphrase)
        if (phrase && keyBuffer.slice(-phrase.length) === phrase) {
          keyBuffer = ''
          setAdmin(!adminMode)
          return
        }
      }
    }

    if (!config.blockShortcuts || adminMode) return

    var key = (e.key || '').toLowerCase()
    var blocked =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(key) !== -1) ||
      (e.ctrlKey && !e.shiftKey && ['u', 's'].indexOf(key) !== -1)

    if (blocked) {
      e.preventDefault()
      e.stopPropagation()
      report('shortcut')
      return false
    }
  }, true)

  if (config.blockSelect) {
    document.addEventListener('selectstart', function (e) {
      if (!adminMode) e.preventDefault()
    })
  }
  if (config.blockDrag) {
    document.addEventListener('dragstart', function (e) {
      if (!adminMode) e.preventDefault()
    })
  }

  var overlay = null
  var lastOpen = false
  var THRESHOLD = 170

  function buildOverlay() {
    overlay = document.createElement('div')
    overlay.setAttribute('role', 'alertdialog')
    overlay.setAttribute('aria-label', 'DevTools đang mở — nội dung đã bị ẩn')
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'text-align:center',
      'padding:24px',
      'background:rgba(10,10,10,0.96)',
      'color:#fff',
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'
    ].join(';')
    overlay.innerHTML =
      '<div style="max-width:420px">' +
      '<div style="font-size:42px;line-height:1">🛡️</div>' +
      '<h2 style="margin:16px 0 8px;font-size:22px;font-weight:700">DevTools đang mở</h2>' +
      '<p style="margin:0;color:#a3a3a3;font-size:14px;line-height:1.6">' +
      'Nội dung trang đã được <b style="color:#f87171">tự động ẩn</b> để bảo vệ mã nguồn.<br>' +
      'Hãy đóng DevTools — trang sẽ tự hiện lại ngay.<br>' +
      '<small style="color:#525252">(Bạn là chủ web? Gõ <b>adminview</b> để tắt bộ chặn)</small>' +
      '</p>' +
      '</div>'
      ; (document.body || document.documentElement).appendChild(overlay)
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay)
    overlay = null
  }

  function checkDevtools() {
    if (adminMode) return

    var widthGap = window.outerWidth - window.innerWidth
    var heightGap = window.outerHeight - window.innerHeight
    var open = widthGap > THRESHOLD || heightGap > THRESHOLD

    if (open && !lastOpen) report('devtools')
    lastOpen = open

    if (open && !overlay) {
      buildOverlay()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && overlay) {
      removeOverlay()
      document.documentElement.style.overflow = ''
    }
  }

  if (config.detectDevtools) {
    function ready() {
      checkDevtools()
      setInterval(checkDevtools, config.checkIntervalMs)
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready)
    } else {
      ready()
    }
  }

  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location
    }
  } catch (e) { }
})()
