# -*- coding: utf-8 -*-
# Card用の架空スクショ(実在の情報なし)。A=問い合わせ管理画面風(PC幅) B=取引メモ風(スマホ幅)
from PIL import Image, ImageDraw, ImageFont
F = lambda s, b=False: ImageFont.truetype("C:/Windows/Fonts/meiryob.ttc" if b else "C:/Windows/Fonts/meiryo.ttc", s)
INK, SUB, LINE, ACC, BG = "#1f2933", "#5b6770", "#d9dee3", "#2f6f9f", "#f4f6f8"
def A():
    W, H = 760, 560
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 56], fill=ACC); d.text((24, 12), "お問い合わせ管理  ／  新着 1件", font=F(18, True), fill="#fff")
    d.rounded_rectangle([24, 80, W - 24, H - 24], 10, fill="#fff", outline=LINE)
    d.text((40, 96), "問い合わせの詳細", font=F(22, True), fill=INK)
    rows = [("お名前", "サンプル 太郎"), ("メール", "taro@example.com"), ("電話番号", "090-0000-0000"), ("郵便番号", "〒000-0000"),
            ("ご案内ページ", "https://example.com/inquiry/0000"), ("カード番号(試験用)", "4111 1111 1111 1111")]
    y = 148
    for lab, val in rows:
        d.text((40, y), lab, font=F(15), fill=SUB); d.text((250, y - 3), val, font=F(23), fill=INK)
        d.line([40, y + 40, W - 40, y + 40], fill=LINE); y += 54
    d.text((40, y + 8), "ご用件", font=F(15), fill=SUB); d.text((250, y + 4), "来週の打ち合わせ日程の相談", font=F(23), fill=INK)
    im.save("testdata/dummy-inquiry.png")
def B():
    W, H = 420, 560
    im = Image.new("RGB", (W, H), "#fbf7f0"); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 52], fill="#8a5a2b"); d.text((16, 10), "取引メモ", font=F(20, True), fill="#fff")
    y = 70
    def item(lab, val):
        nonlocal y
        d.text((16, y), lab, font=F(14), fill="#7a6a58"); d.text((16, y + 22), val, font=F(19), fill="#2b2118")
        d.line([16, y + 58, W - 16, y + 58], fill="#e2d8c8"); y += 70
    item("取引先", "サンプル商店 御中"); item("担当", "見本 花子"); item("連絡先", "080-0000-0000"); item("メール", "hanako@example.jp")
    item("お届け先", "〒000-0000 サンプル県見本市1-2-3"); item("メモ", "来月の納品日を相談する")
    im.save("testdata/dummy-memo.png")
A(); B(); print("ok")
