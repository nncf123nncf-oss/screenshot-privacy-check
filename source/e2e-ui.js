// 画面まわり(Day073の指摘修正分)の実ブラウザ検算。ローカルサーバ http://127.0.0.1:8073/ が必要。実行: node source/e2e-ui.js
const fs = require('fs'), path = require('path');
const { launch } = require('./cdp.js');
const helpers = fs.readFileSync(path.join(__dirname, 'e2e-helpers.js'), 'utf8');
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return ((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
(async () => {
  for (const scheme of ['light', 'dark']) {
    const c = await launch(9377);
    await c.open('http://127.0.0.1:8073/index.html', 375, 812, 2, true, scheme);
    await c.ev(helpers);
    const R = { scheme };
    R.noticeLines = JSON.parse(await c.ev(`JSON.stringify([...document.querySelectorAll('.notice li')].map(l=>Math.round(l.getBoundingClientRect().height/parseFloat(getComputedStyle(l).lineHeight))))`));
    R.noticeHeight = await c.ev(`Math.round(document.querySelector('.notice').getBoundingClientRect().height)`);
    // 縦長の画像(400x3000)を作って読み込む
    await c.ev(`(async()=>{ const cv=document.createElement('canvas'); cv.width=500; cv.height=3000; const x=cv.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,500,3000); x.fillStyle='#222'; x.font='20px sans-serif'; for(let i=0;i<30;i++){ x.fillText('sample line '+i+'  taro'+i+'@example.com  090-0000-00'+(10+i),10,40+i*95); }
      const b=await new Promise(r=>cv.toBlob(r,'image/png')); const dt=new DataTransfer(); dt.items.add(new File([b],'tall.png',{type:'image/png'})); const i=document.getElementById('file'); i.files=dt.files; i.dispatchEvent(new Event('change')); for(let k=0;k<300;k++){ await new Promise(r=>setTimeout(r,100)); if(__sp.ocrState==='done') break; } return __sp.boxes.length; })()`);
    R.boxes = await c.ev(`__sp.boxes.length`);
    R.rowsShown = await c.ev(`document.querySelectorAll('#list .row').length`);
    R.moreText = await c.ev(`(document.getElementById('moreBtn').hidden?'(hidden)':document.getElementById('moreBtn').textContent)`);
    R.stage = JSON.parse(await c.ev(`JSON.stringify({vh:innerHeight, stageH:Math.round(document.getElementById('stage').getBoundingClientRect().height), stageScrollH:document.getElementById('stage').scrollHeight, docH:document.documentElement.scrollHeight, hscroll:document.documentElement.scrollWidth>innerWidth})`));
    // なぞりON: 画像の外側(見出し・ヒント)でページがスクロールできること=ステージが画面の高さに収まっていること
    await c.ev(`document.getElementById('manualBtn').click(); 0`);
    R.manual = JSON.parse(await c.ev(`JSON.stringify({touchAction:getComputedStyle(document.getElementById('view')).touchAction, stageFits: document.getElementById('stage').getBoundingClientRect().height <= innerHeight*0.7+1})`));
    // 拡大
    await c.ev(`document.getElementById('zoomIn').click(); document.getElementById('zoomIn').click(); document.getElementById('zoomIn').click(); 0`);
    await c.sleep(300);
    R.zoom = JSON.parse(await c.ev(`JSON.stringify({label:document.getElementById('zoomLabel').textContent, viewW:Math.round(document.getElementById('view').getBoundingClientRect().width), stageW:document.getElementById('stage').clientWidth, canScrollX:document.getElementById('stage').scrollWidth>document.getElementById('stage').clientWidth, inDisabled:document.getElementById('zoomIn').disabled, outDisabled:document.getElementById('zoomOut').disabled})`));
    // 2本指で移動(四角は増えない)・1本指でなぞると増える
    const mv = await c.ev(`(()=>{ const v=document.getElementById('view'), st=document.getElementById('stage'); const n0=__sp.boxes.length; const sl=st.scrollLeft, stp=st.scrollTop;
      const ev=(t,id,x,y)=>v.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,bubbles:true,cancelable:true,pointerType:'touch'}));
      const r=st.getBoundingClientRect(); const cx=r.left+100, cy=r.top+100;
      ev('pointerdown',1,cx,cy); ev('pointerdown',2,cx+40,cy); ev('pointermove',1,cx-30,cy-40); ev('pointermove',2,cx+10,cy-40); ev('pointermove',1,cx-60,cy-80); ev('pointermove',2,cx-20,cy-80); ev('pointerup',1,cx-60,cy-80); ev('pointerup',2,cx-20,cy-80);
      const moved={dx:st.scrollLeft-sl, dy:st.scrollTop-stp, added:__sp.boxes.length-n0};
      ev('pointerdown',3,cx,cy); ev('pointermove',3,cx+60,cy+30); ev('pointerup',3,cx+60,cy+30);
      moved.addedAfterOneFinger=__sp.boxes.length-n0; return JSON.stringify(moved); })()`);
    R.twoFinger = JSON.parse(mv);
    await c.ev(`document.getElementById('manualBtn').click(); 0`);
    // 折りたたみ・展開・ジャンプ
    R.rowsShown2 = await c.ev(`document.querySelectorAll('#list .row').length`);
    await c.ev(`document.getElementById('moreBtn').click(); 0`);
    R.rowsExpanded = await c.ev(`document.querySelectorAll('#list .row').length`);
    await c.ev(`document.getElementById('moreBtn').click(); window.scrollTo(0,0); 0`);
    await c.ev(`document.getElementById('jumpBtn').click(); 0`); await c.sleep(1200);
    R.jump = JSON.parse(await c.ev(`JSON.stringify({saveInView:(r=>r.top>=0&&r.bottom<=innerHeight)(document.getElementById('saveBtn').getBoundingClientRect()), top:Math.round(document.getElementById('saveBtn').getBoundingClientRect().top), focus:document.activeElement.id})`));
    // 番号丸のコントラスト(実描画色)
    await c.ev(`document.getElementById('moreBtn').click(); 0`);
    await c.ev(`document.querySelectorAll('#list .row')[1].querySelectorAll('button')[1].click(); 0`); // 2番を隠さない
    const col = JSON.parse(await c.ev(`JSON.stringify([...document.querySelectorAll('#list .row')].slice(0,2).map(r=>{const n=r.querySelector('.num'),s=getComputedStyle(n);return {off:r.classList.contains('off'),bg:s.backgroundColor,fg:s.color};}))`));
    const hex = s => '#' + s.match(/\d+/g).slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
    R.numContrast = col.map(x => ({ off: x.off, bg: hex(x.bg), fg: hex(x.fg), ratio: cr(hex(x.bg), hex(x.fg)) }));
    R.listRowOverlap = await c.ev(`(()=>{ const rs=[...document.querySelectorAll('#list .row')].map(r=>r.getBoundingClientRect()); let o=0; for(let i=1;i<rs.length;i++) if(rs[i].top<rs[i-1].bottom-0.5) o++; return o; })()`);
    console.log(JSON.stringify(R)); c.close();
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
