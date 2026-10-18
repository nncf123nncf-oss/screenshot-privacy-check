// S7: 外部へのアクセスを全部名前解決できなくした状態でも、画像選択→文字認識→保存まで通ることを確かめ、
// Chromeのネットワークログ(net-log)から、実際に出たリクエストのURLを全部列挙する。実行: node source/e2e-net.js
const fs = require('fs'), path = require('path'), os = require('os');
const { launch } = require('./cdp.js');
const NETLOG = path.join(os.tmpdir(), 'spc-netlog.json');
(async () => {
  try { fs.unlinkSync(NETLOG); } catch (e) {}
  const c = await launch(9373, ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', '--log-net-log=' + NETLOG, '--net-log-capture-mode=Everything']);
  await c.open('http://127.0.0.1:8073/index.html', 1000, 900, 1, false, 'light');
  const helpers = fs.readFileSync(path.join(__dirname, 'e2e-helpers.js'), 'utf8');
  await c.ev(helpers);
  const r = await c.ev("(async()=>{ const r = await __run('s3_16_w.png'); const url = await __saveUrl(); return JSON.stringify({state:r.state, status:r.status, boxes:__sp.boxes.length, saved: url.slice(0,22)}); })()");
  console.log('アプリの結果:', r);
  await c.sleep(1500); c.close(); await new Promise(r => setTimeout(r, 1500));
  const raw = fs.readFileSync(NETLOG, 'utf8'); let urls = new Set();
  let log; try { log = JSON.parse(raw); } catch (e) { log = JSON.parse(raw.replace(/,\s*$/, '') + ']}'); }
  const names = log.constants.logEventTypes, srcs = log.constants.logSourceType;
  (log.events || []).forEach(ev => { if (ev.params && ev.params.url && /^https?:/.test(ev.params.url)) urls.add(ev.params.url.replace(/^(https?:\/\/[^/]+\/[^?#]*).*$/, '$1')); });
  const list = [...urls].sort();
  console.log('リクエスト先(クエリは省略):'); list.forEach(u => console.log('  ' + u));
  const ext = list.filter(u => !u.startsWith('http://127.0.0.1:8073/'));
  console.log('外部(127.0.0.1:8073以外): ' + ext.length + '件', ext);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
