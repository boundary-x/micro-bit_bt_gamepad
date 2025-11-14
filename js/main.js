(function($, screenFull, sound) {
  'use strict';

  let bluetoothDevice = null;
  let uartCharacteristic = null;

  const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const UART_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

  // ─────────────────────────────────────────────
  // 공통 로그 함수
  // ─────────────────────────────────────────────
  function log(msg, obj) {
    console.log(msg, obj || '');
    const elapsed = Date.now() - pageLoadTime;
    if (obj) {
      try {
        msg += JSON.stringify(obj, null, 2);
      } catch (e) {}
    }
    $('#commands-log').prepend('<p>[' + elapsed + 'ms] ' + msg + '</p>');
  }

  function connectButtonActive(active) {
    if (active) {
      $("#button-connect").text("Connected");
      $("#button-connect").attr('class', 'nes-btn is-success');
    } else {
      $("#button-connect").text("Connect");
      $("#button-connect").attr('class', 'nes-btn is-primary');
    }
  }

  // ─────────────────────────────────────────────
  // Web Bluetooth 연결
  // ─────────────────────────────────────────────
  function connectWebBle() {
    $("#button-connect").text("Connecting...");
    $("#button-connect").attr('class', 'nes-btn is-disable');

    navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [UART_SERVICE_UUID]
    }).then(device => {
      bluetoothDevice = device;
      return device.gatt.connect();
    }).then(server => {
      return server.getPrimaryService(UART_SERVICE_UUID);
    }).then(service => {
      return service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);
    }).then(characteristic => {
      uartCharacteristic = characteristic;
      connectButtonActive(true);
      log('Connected to: ' + bluetoothDevice.name);
      sound.play('connected');
      $('html, body').animate({ scrollTop: $("#controller-svg-div").offset().top }, 1200);
    }).catch(err => {
      log('Connection Error: ' + err.message);
      connectButtonActive(false);
    });
  }

  // ─────────────────────────────────────────────
  // UART 전송
  // ─────────────────────────────────────────────
  function sendMsg(msg) {
    if (!uartCharacteristic) {
      log("Not connected.");
      return;
    }
    const data = new TextEncoder().encode(msg + '\n');
    uartCharacteristic.writeValue(data)
      .then(() => log('Sent: ' + msg))
      .catch(err => log('Write Error: ' + err.message));
  }

  // ─────────────────────────────────────────────
  // 버튼 공통 처리 (터치/마우스/키보드 모두 사용)
  // ─────────────────────────────────────────────
  function controllerButtonPressed(buttonName) {
    let logMsg = 'Pressed: ' + buttonName;
    sound.play(buttonName);
    if (settings.vibrate.value && navigator.vibrate) {
      window.navigator.vibrate(25);
    }

    const message = settings['controller-' + buttonName].value;
    if (uartCharacteristic) {
      sendMsg(message);
    } else {
      logMsg += ' (not connected)';
    }
    log(logMsg);
  }

  // ─────────────────────────────────────────────
  // 버튼 / 설정 핸들러
  // ─────────────────────────────────────────────
  function setUpButtonHandlers() {
    $('#button-connect').click(connectWebBle);
    $('#button-settings').click(() => showSettingsModal(true));
    $('#settings-close').click(() => showSettingsModal(false));
    $('#full-screen-icon').click(() => {
      if (screenFull.enabled) {
        screenFull.toggle($('#controller-svg-div')[0]);
      } else {
        log('ScreenFull not available.');
      }
    });
  }

  // ─────────────────────────────────────────────
  // 터치/마우스 컨트롤러 핸들러
  // ─────────────────────────────────────────────
  function setUpControllerHandlers() {
    $('#controller-button-a').singleTouchClick(() => controllerButtonPressed('a'));
    $('#controller-button-b').singleTouchClick(() => controllerButtonPressed('b'));
    $('#controller-button-start').singleTouchClick(() => controllerButtonPressed('start'));
    $('#controller-button-select').singleTouchClick(() => controllerButtonPressed('select'));
    $('#controller-button-centre').singleTouchClick(() => controllerButtonPressed('center'));

    $('#controller-button-up').singleTouchClick(() => {
      $('#controller-cross').css('transform', 'rotateX(15deg) translate(0, 8px)');
      $('#controller-cross').css('transform-origin', 'center');
      controllerButtonPressed('up');
    });

    $('#controller-button-down').singleTouchClick(() => {
      $('#controller-cross').css('transform', 'rotateX(345deg) translate(0px, 13px)');
      $('#controller-cross').css('transform-origin', 'center');
      controllerButtonPressed('down');
    });

    $('#controller-button-left').singleTouchClick(() => {
      $('#controller-cross').css('transform', 'rotateY(345deg) translate(-10px)');
      $('#controller-cross').css('transform-origin', 'center');
      controllerButtonPressed('left');
    });

    $('#controller-button-right').singleTouchClick(() => {
      $('#controller-cross').css('transform', 'rotateY(15deg) translate(-5px)');
      $('#controller-cross').css('transform-origin', 'center');
      controllerButtonPressed('right');
    });

    $('body').singleTouchClickOff(() => {
      $('#controller-cross-border').css('transform', '');
      $('#controller-cross').css('transform', '');
    });
  }

  // ─────────────────────────────────────────────
  // 설정 모달
  // ─────────────────────────────────────────────
  function showSettingsModal(show) {
    if (show) {
      $('#settings-modal').fadeIn(500);
      $('body').css('overflow', 'hidden');
    } else {
      $('#settings-modal').fadeOut(500);
      $('body').css('overflow', 'initial');
    }
  }

  const pageLoadTime = Date.now();
  const settings = {
    'vibrate': {
      'type': 'checkbox',
      'value': false,
      'enable': () => { if (navigator.vibrate) window.navigator.vibrate(25); },
      'disable': () => {}
    },
    'sound': {
      'type': 'checkbox',
      'value': false,
      'enable': sound.enable,
      'disable': sound.disable
    },
    'logs': {
      'type': 'checkbox',
      'value': false,
      'enable': () => $('#below-controller-content').show(),
      'disable': () => $('#below-controller-content').hide()
    },
    'controller-up':    { 'type': 'input-text', 'value': 'U' },
    'controller-right': { 'type': 'input-text', 'value': 'R' },
    'controller-down':  { 'type': 'input-text', 'value': 'D' },
    'controller-left':  { 'type': 'input-text', 'value': 'L' },
    'controller-center':{ 'type': 'input-text', 'value': 'C' },
    'controller-a':     { 'type': 'input-text', 'value': 'A' },
    'controller-b':     { 'type': 'input-text', 'value': 'B' },
    'controller-start': { 'type': 'input-text', 'value': 'S' },
    'controller-select':{ 'type': 'input-text', 'value': 'SL' },
  };

  function setUpSettings() {
    Object.keys(settings).forEach(key => {
      const setting = settings[key];
      const el = $('#settings-' + key);
      if (setting.type === 'checkbox') {
        el.prop('checked', setting.value);
        if (setting.value) setting.enable();
        el.change(function () {
          setting.value = this.checked;
          if (this.checked) setting.enable();
          else setting.disable();
          log('Setting ' + key + (this.checked ? ' enabled.' : ' disabled.'));
        });
      } else if (setting.type === 'input-text') {
        el.val(setting.value);
        el.change(function () {
          setting.value = $(this).val();
        });
      }
    });
  }

  // ─────────────────────────────────────────────
  // PWA 설치 배너
  // ─────────────────────────────────────────────
  function setUpInstallBanner() {
    $('#install-close').click(() => $('#install-banner').hide());
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
      $('#button-install').click(function () {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choiceResult) {
          log(choiceResult.outcome === 'accepted'
            ? 'Accepted the Add To Home Screen prompt.'
            : 'Dismissed the Add To Home Screen prompt.');
          $('#install-banner').hide();
          deferredPrompt = null;
        });
      });
      $('#install-banner').show();
    });
  }

  // ─────────────────────────────────────────────
  // 키보드 입력 + 애니메이션
  // ─────────────────────────────────────────────

  // 키보드 → 버튼 이름 매핑 (이미지 기준)
  const KEY_TO_BUTTON = {
    'ArrowUp':    'up',
    'ArrowDown':  'down',
    'ArrowLeft':  'left',
    'ArrowRight': 'right',
    'a':          'select',
    'A':          'select',
    's':          'start',
    'S':          'start',
    'd':          'b',
    'D':          'b',
    'f':          'a',
    'F':          'a'
  };

  // 키보드 눌림 상태 저장 (키 반복으로 인한 중복 전송 방지)
  const pressedKeys = {};

  // 키보드용 시각 효과를 위한 CSS 클래스 주입
  (function injectKeyboardStyle() {
  const style = document.createElement('style');
  style.textContent = `
      .keyboard-pressed {
        transform: translateY(1px) scale(0.99);
        filter: brightness(0.95);
        transition: transform 0.05s ease, filter 0.05s ease;
      }
    `;
  document.head.appendChild(style);
})();

  function animateButton(buttonName, isDown) {
    const cross = $('#controller-cross');
    const crossBorder = $('#controller-cross-border');

    if (buttonName === 'up') {
      if (isDown) {
        cross.css('transform', 'rotateX(15deg) translate(0, 8px)');
        cross.css('transform-origin', 'center');
      } else {
        cross.css('transform', '');
        crossBorder.css('transform', '');
      }
    } else if (buttonName === 'down') {
      if (isDown) {
        cross.css('transform', 'rotateX(345deg) translate(0px, 13px)');
        cross.css('transform-origin', 'center');
      } else {
        cross.css('transform', '');
        crossBorder.css('transform', '');
      }
    } else if (buttonName === 'left') {
      if (isDown) {
        cross.css('transform', 'rotateY(345deg) translate(-10px)');
        cross.css('transform-origin', 'center');
      } else {
        cross.css('transform', '');
        crossBorder.css('transform', '');
      }
    } else if (buttonName === 'right') {
      if (isDown) {
        cross.css('transform', 'rotateY(15deg) translate(-5px)');
        cross.css('transform-origin', 'center');
      } else {
        cross.css('transform', '');
        crossBorder.css('transform', '');
      }
    } else {
      // A/B/START/SELECT/center 등
      const map = {
        'a': '#controller-button-a',
        'b': '#controller-button-b',
        'start': '#controller-button-start',
        'select': '#controller-button-select',
        'center': '#controller-button-centre'
      };
      const sel = map[buttonName];
      if (sel) {
        const $el = $(sel);
        if (isDown) {
          $el.addClass('keyboard-pressed');
        } else {
          $el.removeClass('keyboard-pressed');
        }
      }
    }
  }

  function resetAllKeyboardAnimations() {
    $('#controller-cross').css('transform', '');
    $('#controller-cross-border').css('transform', '');
    ['#controller-button-a', '#controller-button-b',
     '#controller-button-start', '#controller-button-select',
     '#controller-button-centre'].forEach(id => {
      $(id).removeClass('keyboard-pressed');
    });
  }

  function setUpKeyboardHandlers() {
    // keydown: 전송 + 애니메이션
    $(document).on('keydown', function (e) {
      const key = e.key;
      const buttonName = KEY_TO_BUTTON[key];
      if (!buttonName) return;

      // 방향키 기본 스크롤 방지
      e.preventDefault();

      // 이미 눌려있는 키면 무시 (키보드 자동 반복 방지)
      if (pressedKeys[key]) return;
      pressedKeys[key] = true;

      animateButton(buttonName, true);
      controllerButtonPressed(buttonName);
    });

    // keyup: 애니메이션 해제
    $(document).on('keyup', function (e) {
      const key = e.key;
      const buttonName = KEY_TO_BUTTON[key];
      if (!buttonName) return;

      e.preventDefault();
      pressedKeys[key] = false;
      animateButton(buttonName, false);
    });

    // 창 포커스가 사라질 때 모든 상태 초기화
    $(window).on('blur', function () {
      Object.keys(pressedKeys).forEach(k => pressedKeys[k] = false);
      resetAllKeyboardAnimations();
    });
  }

  // ─────────────────────────────────────────────
  // 실행
  // ─────────────────────────────────────────────
  setUpSettings();
  setUpButtonHandlers();
  setUpControllerHandlers();
  setUpInstallBanner();
  setUpKeyboardHandlers();   // ← 추가

})(jQuery, screenfull, sound);
