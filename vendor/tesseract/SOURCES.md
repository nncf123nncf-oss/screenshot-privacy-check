# 同梱ファイルの取得元（Day073 スクショ見張り番）

取得日: 2026-10-18 ／ 取得方法: npm レジストリ（registry.npmjs.org）から公開パッケージを取得し、必要なファイルだけをコピー（改変なし）。
実行時に外部CDNへは取りに行きません（`workerPath`/`corePath`/`langPath` はすべて同一オリジンの相対パス）。

| ファイル | 取得元パッケージ | 版 | ライセンス | サイズ(バイト) |
|---|---|---|---|---|
| tesseract.min.js | tesseract.js | 7.0.0 | Apache-2.0 | 62,961 |
| worker.min.js | tesseract.js | 7.0.0 | Apache-2.0 | 111,307 |
| core/tesseract-core-relaxedsimd-lstm.wasm.js | tesseract.js-core | 7.0.0 | Apache-2.0 | 3,905,767 |
| core/tesseract-core-simd-lstm.wasm.js | tesseract.js-core | 7.0.0 | Apache-2.0 | 3,899,472 |
| core/tesseract-core-lstm.wasm.js | tesseract.js-core | 7.0.0 | Apache-2.0 | 3,896,484 |
| lang/jpn.traineddata.gz（4.0.0_best_int） | @tesseract.js-data/jpn | 1.0.0（パッケージ。MITのラッパーで、データはTesseractの学習済みデータ） | Apache-2.0（Tesseract学習データ） | 2,030,256 |

- core は端末のWebAssembly対応に応じて、上3つのうち1つだけが読み込まれます（約3.9MB）。
- 1回の利用で読み込む合計（index.html を除く）: tesseract.min.js + worker.min.js + core 1つ + jpn ≒ 6.1MB（圧縮配信なしの値）。
- 英数字は日本語データだけで読み取れることをダミー画像で確認したため、eng.traineddata は同梱していません。
- ライセンス全文: LICENSE.md（tesseract.js）、core/LICENSE（tesseract.js-core）。
