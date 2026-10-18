# スクショ見張り番（screenshot-privacy-check）

スクショを読み込むと、写っている文字をブラウザの中で読み取り、メールアドレス・電話番号・郵便番号・URL・長い数字らしい箇所に赤枠を付けます。塗りつぶしかぼかしで隠した画像を保存できます（100日100プロダクト Day073）。

- 画像と読み取った文字は端末の外に出ません（通信は閲覧数の計測のみ）。文字認識は同梱の Tesseract.js（Apache-2.0）で、外部のサービスやAIは使っていません
- 自動検出は完全ではありません。氏名・住所は見つけにくいです。保存前に自分の目で確認してください
- 同梱ファイルの取得元と版: vendor/tesseract/SOURCES.md

## 開発用（source/）
- `run-checks.js`: 検出・正規化・ぼかし・端末判定の検算（`node source/run-checks.js`）
- `e2e-helpers.js` / `e2e-net.js`: 実ブラウザの検算（外部名前解決を止めた状態での通し・通信先の列挙）
- `e2e-ui.js`: 画面まわりの実ブラウザ検算（注意の行数・拡大・2本指移動・一覧の折りたたみ・保存ボタンへの移動・番号丸のコントラスト）
- `make_testdata.py` / `make_stress.py` / `make_dummy.py`: 架空のテスト画像（実在のメール・電話・氏名なし）
- `shoot.js`: 投稿用の素材撮影（Chrome headless）

運営: みちAIワークス https://michi-portfolio.vercel.app/
