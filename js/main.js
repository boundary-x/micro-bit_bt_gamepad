(function($, screenFull, sound) {
    'use strict';
  
    let bluetoothDevice = null;
    let uartCharacteristic = null;
  
    const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    const UART_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  
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
      'controller-up': { 'type': 'input-text', 'value': 'U' },
      'controller-right': { 'type': 'input-text', 'value': 'R' },
      'controller-down': { 'type': 'input-text', 'value': 'D' },
      'controller-left': { 'type': 'input-text', 'value': 'L' },
      'controller-center': { 'type': 'input-text', 'value': 'C' },
      'controller-a': { 'type': 'input-text', 'value': 'A' },
      'controller-b': { 'type': 'input-text', 'value': 'B' },
      'controller-start': { 'type': 'input-text', 'value': 'S' },
      'controller-select': { 'type': 'input-text', 'value': 'SL' },
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
  
    // 실행
    setUpSettings();
    setUpButtonHandlers();
    setUpControllerHandlers();
    setUpInstallBanner();
  
  })(jQuery, screenfull, sound);
  