// ブラウザ実機検算用の補助(画面には読み込まれない。Chromeのコンソール/検算ツールから eval する)
window.__run = async function (name, mode) {
  const blob = await (await fetch('source/testdata/' + name)).blob();
  const f = new File([blob], name, { type: blob.type || 'image/png' });
  const dt = new DataTransfer(); dt.items.add(f);
  const inp = document.getElementById('file'); inp.files = dt.files;
  const t0 = performance.now();
  inp.dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 50));
  for (let i = 0; i < 900; i++) { if (window.__sp.ocrState === 'done' || window.__sp.ocrState === 'error') break; await new Promise(r => setTimeout(r, 100)); }
  return { ms: Math.round(performance.now() - t0), state: window.__sp.ocrState, status: document.getElementById('status').textContent };
};
window.__evalFile = async function (m) {
  const r = await __run(m.file);
  const boxes = window.__sp.boxes, res = { file: m.file, ms: r.ms, rows: [], extra: 0 }, used = new Set();
  m.rows.forEach(row => {
    const [x0, y0, x1, y1] = row.bbox;
    const hit = boxes.find(b => (b.y < y1 && b.y + b.h > y0) && (b.x < x1 && b.x + b.w > x0));
    if (row.kind) {
      if (hit) { used.add(hit); res.rows.push({ v: row.value, found: true, cover: hit.x <= x0 + 2 && hit.x + hit.w >= x1 - 2 && hit.y <= y0 + 2 && hit.y + hit.h >= y1 - 2, kind: hit.kind, want: row.kind }); }
      else res.rows.push({ v: row.value, found: false });
    } else if (hit) { used.add(hit); res.extra++; res.rows.push({ v: row.value, FP: hit.kind }); }
  });
  res.extra += boxes.filter(b => !used.has(b)).length; res.nbox = boxes.length;
  return res;
};
window.__fmt = o => { const exp = o.rows.filter(r => r.want || r.found === false).length, found = o.rows.filter(r => r.found).length, cov = o.rows.filter(r => r.found && r.cover).length;
  return `${o.file} exp=${exp} found=${found} cover=${cov} extra=${o.extra} ${o.ms}ms miss=[${o.rows.filter(r => r.found === false).map(r => r.v)}]`; };
// S6: 隠した画像を別のワーカーで再度読み取る(アプリのワーカーとは別)
window.__reocr = async function (url) {
  if (!window.__w2) window.__w2 = await Tesseract.createWorker('jpn', 1, { workerPath: 'vendor/tesseract/worker.min.js', corePath: 'vendor/tesseract/core/', langPath: 'vendor/tesseract/lang/', cacheMethod: 'none', workerBlobURL: false });
  const r = await __w2.recognize(url, {}, { blocks: true });
  const lines = []; ((r.data.blocks) || []).forEach(b => b.paragraphs.forEach(p => p.lines.forEach(l => lines.push(l.text.trim()))));
  return lines;
};
window.__saveUrl = async function () {
  navigator.canShare = () => false;
  document.getElementById('saveBtn').click();
  await new Promise(r => setTimeout(r, 300));
  return document.getElementById('resultImg').src;
};
