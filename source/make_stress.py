# -*- coding: utf-8 -*-
# S5の追加(厳しい条件): 縮小したスクショ・JPEG圧縮・別書体。truth-stress.json に正解位置を書く
import json
from PIL import Image
import importlib.util, sys
meta = json.load(open("testdata/truth.json", encoding="utf-8"))
out = []
for m in meta:
    if m["px"] != 16 or m["cond"] != "w": continue
    img = Image.open("testdata/" + m["file"]).convert("RGB")
    for tag, k, fmt, q in (("sc75", 0.75, "png", None), ("sc60jpg", 0.6, "jpg", 50), ("sc50jpg", 0.5, "jpg", 60)):
        w, h = int(img.width * k), int(img.height * k)
        im2 = img.resize((w, h), Image.LANCZOS)
        name = f"{m['set']}_{tag}.{fmt}"
        if fmt == "jpg": im2.save("testdata/" + name, quality=q)
        else: im2.save("testdata/" + name)
        rows = [dict(r, bbox=[int(v * k) for v in r["bbox"]]) for r in m["rows"]]
        out.append({"file": name, "set": m["set"], "cond": tag, "rows": rows})
json.dump(out, open("testdata/truth-stress.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out))
