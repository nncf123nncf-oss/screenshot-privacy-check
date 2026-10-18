// 検出・正規化・ぼかし・端末判定(index.html の <script id="core">)の検算。実行: node source/run-checks.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.match(/<script id="core">([\s\S]*?)<\/script>/)[1];
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + ';this.SP=SP;', ctx);
const SP = ctx.SP;
let n = 0, f = 0; const J = v => JSON.stringify(v);
const eq = (a, b, m) => { n++; if (J(a) !== J(b)) { f++; console.log('NG', m, J(a), '!=', J(b)); } };
const kinds = t => SP.findCandidates(t).map(c => c.kind + ':' + t.slice(c.s, c.e));
// S1
eq(kinds('メール : taro@example.com'), ['email:taro@example.com'], 'S1 taro');
eq(kinds('連絡 先 : info-test@example.co.jp'), ['email:info-test@example.co.jp'], 'S1 info-test');
eq(kinds('返信 先 : a.b+c@sub.example.com'), ['email:a.b+c@sub.example.com'], 'S1 a.b+c');
eq(kinds('taro(a)example.com').map(x => x.split(':')[0]), ['email'], 'S1 (a)');
eq(kinds('taro⑳example.com').map(x => x.split(':')[0]), ['email'], 'S1 ⑳');
eq(kinds('taro＠example.com').map(x => x.split(':')[0]), ['email'], 'S1 全角@');
eq(kinds('taro@ example.com').map(x => x.split(':')[0]), ['email'], 'S1 @の後に空白');
eq(kinds('2026 © example.com').map(x => x.split(':')[0]), ['domain'], 'S1 ©周りに空白→メールにしない(ドメインのみ)');
eq(kinds('taroexample.com').map(x => x.split(':')[0]), ['domain'], 'S1 @欠落の保険');
// S2
eq(kinds('携帯 : 090-0000-0000'), ['phone:090-0000-0000'], 'S2 携帯');
eq(kinds('固定 : 03-0000-0000'), ['phone:03-0000-0000'], 'S2 固定');
eq(kinds('0120-000-000'), ['phone:0120-000-000'], 'S2 フリー');
eq(kinds('ハイフンなし : 09000000000.'), ['phone:09000000000'], 'S2 ハイフンなし');
eq(kinds('全角 : ０９０－００００－０００１'), ['phone:０９０－００００－０００１'], 'S2 全角');
eq(kinds('全角 : 090 一 0000-0001'), ['phone:090 一 0000-0001'], 'S2 OCRが一を読む');
eq(kinds('全角 : 090--0000-0001'), ['phone:090--0000-0001'], 'S2 二重ハイフン');
// S3
eq(kinds('郵便 : 〒000-0000'), ['zip:〒000-0000'], 'S3 〒');
eq(kinds('郵便 : 000-0000'), ['zip:000-0000'], 'S3 記号なし');
eq(kinds('URL : https://example.com/a?b=1'), ['url:https://example.com/a?b=1'], 'S3 url');
eq(kinds('URL : https:/example.com/a2b=1'), ['url:https:/example.com/a2b=1'], 'S3 url 崩れ');
eq(kinds('サイト : www.example.com'), ['url:www.example.com'], 'S3 www');
eq(kinds('サイト : wwwexample.com').map(x => x.split(':')[0]), ['domain'], 'S3 wwwのドット欠落');
eq(kinds('カード : 4111 1111 1111 1111'), ['card:4111 1111 1111 1111'], 'S3 カード空白');
eq(kinds('カード2 : 4111-1111-1111-1111'), ['card:4111-1111-1111-1111'], 'S3 カードハイフン');
eq(kinds('4111111111111111'), ['card:4111111111111111'], 'S3 カード連続');
// S4
['日付 : 2026 年 10 月 18 日', '日付2 : 2026-10-18', '金額 : 1,234,567 円', '金額2 : 12,345,000 円', '版 : v1.2.3', '数字 : 2026', '時刻 : 10:30', '金額 : 1L234,567 円', '全額 : 12,345.000 円', '版 : v12.3', '日付 : 2026 年 10 月 18 晶']
  .forEach(t => eq(kinds(t), [], 'S4 候補0 ' + t));
eq(kinds('2026-10-18 10:30'), [], 'S4 日付+時刻');
// ラベルの伏せ字
eq(SP.maskLabel('taro@example.com'), 't********m', 'mask email');
eq(SP.maskLabel('ab'), '＊＊', 'mask short');
eq(SP.maskLabel('4111 1111 1111 1111').length, 10, 'mask card');
eq(SP.maskLabel('4111 1111 1111 1111').indexOf('1111'), -1, 'mask card 中身が見えない');
// S8 UA
const U = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.153 Mobile/15E148 Safari/604.1',
  ipadSafari: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  ipadDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  winChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
};
eq(SP.isIOS(U.iphoneSafari, 'iPhone', 5), true, 'S8 iPhone Safari');
eq(SP.isIOS(U.iphoneChrome, 'iPhone', 5), true, 'S8 iPhone Chrome(CriOS)');
eq(SP.isIOS(U.ipadSafari, 'iPad', 5), true, 'S8 iPad Safari');
eq(SP.isIOS(U.ipadDesktop, 'MacIntel', 5), true, 'S8 iPadデスクトップ表示');
eq(SP.isIOS(U.winChrome, 'Win32', 0), false, 'S8 Windows Chrome');
eq(SP.isIOS(U.androidChrome, 'Linux armv8l', 5), false, 'S8 Android Chrome');
eq(SP.isIOS(U.macSafari, 'MacIntel', 0), false, 'S8 macOS Safari');
eq(SP.saveRoute(false), 'longpress', 'S8 canShare非対応→経路2');
eq(SP.saveRoute(true), 'share', 'S8 canShare対応→経路1');
// boxBlur: 領域外の画素を使わない/平均が保存される
(function () {
  const w = 40, h = 10, d = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) { const v = (i % w) % 4 < 2 ? 0 : 255; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  const mean0 = d.reduce((a, v, i) => i % 4 === 0 ? a + v : a, 0) / (w * h);
  SP.boxBlur(d, w, h, 8);
  let mn = 255, mx = 0; for (let y = 3; y < 7; y++) for (let x = 14; x < 26; x++) { const v = d[(y * w + x) * 4]; mn = Math.min(mn, v); mx = Math.max(mx, v); }
  eq(mx - mn <= 20, true, 'blur 中央部で縞が潰れる 差=' + (mx - mn));
  eq(SP.blurRadius(10), 8, 'blur 半径 最小8'); eq(SP.blurRadius(40), 24, 'blur 半径 0.6倍');
})();

// レビュー①の反映: URLの途中の数字・電話・メールはURL全体を1候補にまとめる
eq(kinds('https://x.com/handle/status/1234567890123456789'), ['url:https://x.com/handle/status/1234567890123456789'], 'R URL内の19桁');
eq(kinds('https://example.com/u/090-0000-0000/profile'), ['url:https://example.com/u/090-0000-0000/profile'], 'R URL内の電話');
eq(kinds('https://example.com/?u=a@b.com&x=1'), ['url:https://example.com/?u=a@b.com&x=1'], 'R URL内のメール');
eq(kinds('携帯 : 0 9 0 - 0 0 0 0 - 0 0 0 0').map(x => x.split(':')[0]), ['phone'], 'R 桁ごとに空白の電話');
eq(kinds('日付 : 2026-10-18 時刻 10:30'), [], 'R 日付と時刻は0件のまま');
console.log(`検算 ${n}件 / NG ${f}件`);
process.exit(f ? 1 : 0);
