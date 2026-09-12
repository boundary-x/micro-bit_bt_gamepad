/* Guide views do not invoke controller actions or Bluetooth writes. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const link = (url, title) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${title} ↗</a>`;
  const help = document.createElement('dialog');
  help.id = 'game-support'; help.className = 'support-dialog'; help.setAttribute('aria-labelledby','support-title');
  help.innerHTML = `<div class="support-heading"><h2 id="support-title">사용 가이드 및 지원</h2><button id="support-close" type="button">닫기 ×</button></div><div class="support-content"><p>게임패드 버튼으로 마이크로비트를 무선 조종해보세요.</p><button id="start-tour" class="support-primary" type="button">사용법 둘러보기 →</button><details id="support-examples"><summary>마이크로비트 예제 코드</summary><p>${link('https://makecode.microbit.org/S49771-77509-50114-72682','블루투스 이름 확인 코드')}</p><p>연결할 마이크로비트의 장치 이름을 확인합니다. 마이크로비트의 LED 매트릭스에 출력되는 이름(알파벳 소문자 5자리)을 확인한 뒤 아래 프로젝트 코드를 다운로드하세요.</p><p>${link('https://makecode.microbit.org/S31099-38080-98102-10175','마이크로비트 기본 예제')}</p><p>${link('https://makecode.microbit.org/#pub:11985-92634-34666-29315','AI 포니봇 예제')}</p><p>${link('https://makecode.microbit.org/#pub:50417-75357-91600-41549','비트런 예제')}</p><p>MakeCode 프로젝트 설정에서 블루투스 페어링을 필요하지 않음으로 설정하세요. 받은 문자열에 따라 동작하도록 조건문을 구성하세요.</p></details><details id="support-mapping"><summary>버튼별 전송 데이터 · 키보드</summary><p>현재 Settings에 적용된 값입니다. 각 문자열 뒤에는 줄바꿈이 붙습니다.</p><table><thead><tr><th>버튼</th><th>키보드</th><th>현재 데이터</th></tr></thead><tbody id="mapping-body"></tbody></table><p>키보드 A/S/D/F는 각각 SELECT/START/B/A입니다. 중앙 버튼에는 키보드 단축키가 없습니다.</p><p>설정 변경은 현재 페이지에 적용됩니다. 새로고침하면 기본값으로 돌아갑니다.</p></details><details><summary>수업 자료</summary><p>${link('https://1drv.ms/p/c/fae158da74b76feb/IQB2pnNYyszZQqPEofe4WhaNAVn2nzKcwSA8POcYvnwb9pE?e=WPDVny','원격 제어 모바일 로봇 시스템 · AI 포니봇')}</p><p>${link('https://1drv.ms/p/c/fae158da74b76feb/IQCEsJdSQzXhSJkl8y4vPX3EAe_-UJDfWhF0KvBn575AuxI?e=9Wfxkp','무선으로 제어하는 IoT 로봇 프로젝트 · 비트런')}</p></details><details><summary>문제 해결</summary><p><strong>연결이 안 돼요</strong><br>마이크로비트 전원·UART 예제·장치 이름을 확인하고 다른 앱의 연결을 해제하세요. PC는 Chrome·Edge, 안드로이드는 Chrome, 아이폰은 Bluefy를 사용하세요.</p><p><strong>소리는 나는데 기기가 움직이지 않아요</strong><br>소리와 버튼 효과는 연결 전에도 나타납니다. Connected 표시와 Settings의 Show Logs를 확인하세요. Pressed는 버튼 입력, Sent는 쓰기 성공, Write Error는 쓰기 실패를 의미합니다. Sent도 기기 동작 완료를 확인하는 응답은 아닙니다.</p><p><strong>손을 떼면 멈추나요?</strong><br>손이나 키를 뗄 때 자동으로 stop을 보내지 않습니다. 정지에 사용할 버튼과 문자열을 마이크로비트 코드에 지정하세요. 키보드를 길게 눌러도 자동 반복 전송하지 않습니다.</p><p><strong>연결 표시가 남아 있는데 반응하지 않아요</strong><br>연결이 끊겨도 이전 표시가 남을 수 있습니다. 전원·거리를 확인하고 Connect/Connected 버튼으로 다시 연결하세요.</p><p><strong>도움말이나 설정에서 키가 작동하지 않아요</strong><br>내용을 읽거나 입력하는 동안 게임패드 명령은 일시적으로 차단됩니다. 창을 닫으면 다시 조작할 수 있습니다.</p></details><details><summary>업데이트 노트</summary><ul><li>게임패드 디자인에 맞춘 도움말과 화면 가이드 추가</li><li>현재 전송 설정·키보드 대응표, 예제와 교안 연결</li><li>도움말·설정 입력 중 게임패드 단축키 전송 차단</li></ul></details><p>${link('https://boundaryx.io/ai/?bmode=view&idx=165155858&t=board','소개 · 프로젝트 활용 방법')}</p></div>`;
  document.body.appendChild(help);
  const mapping = [['up','↑','↑'],['down','↓','↓'],['left','←','←'],['right','→','→'],['center','중앙','없음'],['a','A','F'],['b','B','D'],['start','START','S'],['select','SELECT','A']];
  function updateMapping() {
    $('mapping-body').replaceChildren(...mapping.map(([id,label,key]) => {
      const row=document.createElement('tr');
      [label,key,$('settings-controller-'+id).value || '(빈 문자열)'].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.appendChild(cell);});return row;
    }));
  }
  let opener;
  function openHelp(button) {
    opener=button;document.dispatchEvent(new Event('supportopening'));document.body.classList.add('support-active');
    (document.fullscreenElement || document.body).appendChild(help);updateMapping();help.showModal();$('support-close').focus();
  }
  $('button-help').addEventListener('click',()=>openHelp($('button-help')));
  $('fullscreen-help').addEventListener('click',()=>openHelp($('fullscreen-help')));
  $('support-close').addEventListener('click',()=>help.close());
  help.addEventListener('close',()=>{if(!tour.open){document.body.classList.remove('support-active');if(opener && opener.getClientRects().length)opener.focus();}});
  const tour=document.createElement('dialog');tour.id='game-tour';tour.className='support-dialog';tour.setAttribute('aria-labelledby','tour-title');tour.setAttribute('aria-describedby','tour-text');
  tour.innerHTML='<div id="tour-spot" aria-hidden="true"></div><section id="tour-panel"><div class="tour-top"><span id="tour-progress"></span><button id="tour-close" type="button">닫기 ×</button></div><div aria-live="polite"><h2 id="tour-title"></h2><p id="tour-text"></p></div><p class="tour-caption">화면 안내입니다. 실제 명령은 전송하지 않습니다.</p><div class="tour-nav"><button id="tour-prev" type="button">이전</button><button id="tour-next" type="button">다음</button></div></section>';
  document.body.appendChild(tour);
  const steps=[['#button-help','예제 코드를 준비하세요','도움말의 마이크로비트 예제 코드에서 장치 이름을 확인하고 프로젝트 코드를 다운로드하세요.'],['#button-connect','마이크로비트를 연결하세요','Connect를 누르고 장치를 선택하세요. 연결에 성공하면 Connected로 바뀝니다.'],['#controller-cross','방향키와 중앙 버튼','방향키와 중앙 버튼에 설정된 문자열을 전송합니다. 손을 떼도 자동 정지하지 않으므로 정지 버튼을 코드에 지정하세요.'],['#controller-button-a','A/B · START/SELECT','각 버튼도 Settings에 지정한 문자열을 전송합니다. 버튼의 소리나 시각 효과만으로 전송 성공을 판단하지 마세요.'],['#button-settings','전송 데이터를 바꾸세요','Settings에서 버튼별 문자열을 변경하세요. 도움말의 버튼별 전송 데이터에서 현재 값과 키보드 대응표를 확인할 수 있습니다.'],['#controller-svg','키보드로도 조작하세요','방향키와 A/S/D/F를 사용하세요. A/S/D/F는 SELECT/START/B/A에 대응합니다. 도움말·설정 창을 닫은 뒤 조작하세요.']];
  let index=0,scroll=0;
  function position() {
    if(!tour.open)return;const panel=$('tour-panel'),spot=$('tour-spot'),target=document.querySelector(steps[index][0]);
    panel.style.width=Math.min(340,innerWidth-24)+'px';let ph=panel.getBoundingClientRect().height,pw=panel.getBoundingClientRect().width;
    target.scrollIntoView({block:'center',behavior:'instant'});let r=target.getBoundingClientRect();
    let x=innerWidth-pw-12,y=innerHeight-ph-12;
    if(innerWidth<700){window.scrollBy(0,r.top-12);r=target.getBoundingClientRect();}
    else {const candidates=[[r.right+16,12],[r.left-pw-16,12],[12,r.bottom+16],[12,r.top-ph-16]];const fit=candidates.find(([a,b])=>a>=12&&b>=12&&a+pw<=innerWidth-12&&b+ph<=innerHeight-12);if(fit)[x,y]=fit;}
    panel.style.left=x+'px';panel.style.top=Math.max(12,y)+'px';let left=Math.max(4,r.left),top=Math.max(4,r.top),right=Math.min(innerWidth-4,r.right),bottom=Math.min(innerHeight-4,r.bottom);
    if(left<x+pw&&right>x&&top<y+ph&&bottom>y){if(innerWidth>=700&&left<x-12)right=x-12;else bottom=y-12;}
    Object.assign(spot.style,{left:left+'px',top:top+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});
  }
  function render(){const [,title,text]=steps[index];$('tour-title').textContent=title;$('tour-text').textContent=text;$('tour-progress').textContent=(index+1)+' / '+steps.length;$('tour-prev').disabled=index===0;$('tour-next').textContent=index===steps.length-1?'안내 마치기':'다음';position();}
  $('start-tour').addEventListener('click',async()=>{
    if(document.fullscreenElement)await document.exitFullscreen();
    scroll=window.scrollY;index=0;tour.showModal();help.close();document.body.classList.add('support-active');render();$('tour-next').focus();
  });
  $('tour-next').addEventListener('click',()=>{if(index===steps.length-1)tour.close();else{index++;render();}});
  $('tour-prev').addEventListener('click',()=>{if(index>0){index--;render();}});
  $('tour-close').addEventListener('click',()=>tour.close());
  tour.addEventListener('close',()=>{window.scrollTo(0,scroll);openHelp($('button-help'));$('start-tour').focus();});
  window.addEventListener('resize',position);
})();
