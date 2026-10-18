# -*- coding: utf-8 -*-
# Day073 テスト用ダミー画像の生成。実在のメール・電話・住所は使わない(example.com/0000系のみ)
import json, sys
from PIL import Image, ImageDraw, ImageFont
FONT = "C:/Windows/Fonts/meiryo.ttc"
SETS = {
 "s1": [("メール", "taro@example.com", "email"), ("連絡先", "info-test@example.co.jp", "email"), ("返信先", "a.b+c@sub.example.com", "email")],
 "s2": [("携帯", "090-0000-0000", "phone"), ("固定", "03-0000-0000", "phone"), ("フリーダイヤル", "0120-000-000", "phone"),
        ("ハイフンなし", "09000000000", "phone"), ("全角", "０９０－００００－０００１", "phone")],
 "s3": [("郵便", "〒000-0000", "zip"), ("郵便(記号なし)", "000-0000", "zip"), ("URL", "https://example.com/a?b=1", "url"),
        ("サイト", "www.example.com", "url"), ("カード", "4111 1111 1111 1111", "card"), ("カード2", "4111-1111-1111-1111", "card")],
 "s4": [("日付", "2026年10月18日", None), ("日付2", "2026-10-18", None), ("金額", "1,234,567円", None), ("金額2", "12,345,000円", None),
        ("版", "v1.2.3", None), ("数字", "2026", None), ("時刻", "10:30", None)],
}
def make(name, rows, px, bg, fg, w=760):
    f = ImageFont.truetype(FONT, px)
    lh = int(px * 2.2)
    h = lh * len(rows) + px * 2
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    truth = []
    for i, (lab, val, kind) in enumerate(rows):
        y = px + i * lh
        d.text((px, y), lab + "：", font=f, fill=fg)
        x = px + int(d.textlength(lab + "： ", font=f))
        d.text((x, y), val, font=f, fill=fg)
        bb = d.textbbox((x, y), val, font=f)
        truth.append({"label": lab, "value": val, "kind": kind, "bbox": list(bb)})
    img.save(name)
    return {"file": name, "w": w, "h": h, "px": px, "rows": truth}
meta = []
conds = {"w": ("#FFFFFF", "#222222"), "d": ("#1E2227", "#E6E6E6"), "lc": ("#FFFFFF", "#B8B8B8")}
for s, rows in SETS.items():
    for px in (12, 16, 24):
        for c, (bg, fg) in conds.items():
            if c != "w" and px != 16 and not (c == "lc" and px == 12): 
                if c == "d" and px != 16: continue
                if c == "lc" and px != 12: continue
            m = make(f"{s}_{px}_{c}.png", rows, px, bg, fg)
            m["set"] = s; m["cond"] = c
            meta.append(m)
json.dump(meta, open("truth.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(meta), "files")
