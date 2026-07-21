/**
 * clean-md-source.mjs — 清洗本地 src/posts/*.md 的图片语法(2026-07-21)
 *
 * .md 源统一用完整 BOS URL,把 Vue v-for 块展开为标准 markdown ![](url),
 * 内容与 DB content_markdown 对齐(防将来 migrate 重导时再污染)。
 *
 * 注:data/posts.js 当前是死代码(无组件 import),.md 不参与 build/运行,
 *     此清洗仅作"源备份一致性"。纯文件处理,不连 DB,幂等。
 *
 * 用法: node scripts/clean-md-source.mjs [--dry-run]
 */
import fs from "node:fs/promises";
import path from "node:path";

const BOS_BASE = "https://img.shabox.fun";
const POSTS_DIR = "src/posts";
const dry = process.argv.includes("--dry-run");

function dedupUrl(md) {
  return md.replace(
    /https:\/\/img\.shabox\.fun(?=https:\/\/img\.shabox\.fun)/g,
    "",
  );
}
function absolutize(md) {
  return md.replace(
    /(^|[("'\s])(\/(?:posts|@system)\/)/g,
    (_m, pre, p) => `${pre}${BOS_BASE}${p}`,
  );
}
function renderVueTemplate(tpl, n) {
  let out = tpl.replace(/^`|`$/g, "");
  out = out.replace(/\$\{__CDN__\}/g, BOS_BASE);
  out = out.replace(
    /\$\{\(\s*n\s*([+-])\s*(\d+)\s*\)\.toString\(\)\.padStart\(\s*(\d+)\s*,\s*'0'\s*\)\}/g,
    (_m, op, k, pad) => {
      const v = op === "-" ? n - Number(k) : n + Number(k);
      return String(v).padStart(Number(pad), "0");
    },
  );
  out = out.replace(/\$\{\s*n\s*\}/g, String(n));
  return out.includes("${") ? null : out;
}
function expandVueImgs(md, stats) {
  return md.replace(/<img\b[^>]*>/g, (tag) => {
    if (!/\sv-for=/.test(tag)) return tag;
    const nM = tag.match(/v-for="n\s+in\s+(\d+)"/);
    const sM = tag.match(/:src="([^"]*)"/);
    if (!nM || !sM) {
      stats.skipped.push(tag.slice(0, 80));
      return tag;
    }
    const count = Number(nM[1]);
    const tpl = sM[1];
    const lines = [];
    for (let i = 1; i <= count; i++) {
      const u = renderVueTemplate(tpl, i);
      if (u === null) {
        stats.skipped.push(tag.slice(0, 80));
        return tag;
      }
      lines.push(`![](${u})`);
    }
    stats.expanded += count;
    return lines.join("\n");
  });
}
function markGalleryDiv(md) {
  return md.replace(
    /<div\s+style="[^"]*\bflex\b[^"]*">/g,
    '<div class="post-gallery">',
  );
}
function clean(md, stats) {
  let o = dedupUrl(md);
  o = absolutize(o);
  o = expandVueImgs(o, stats);
  o = markGalleryDiv(o);
  return o;
}

const stats = { expanded: 0, skipped: [] };
const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
let changed = 0;
for (const f of files) {
  const fp = path.join(POSTS_DIR, f);
  const orig = await fs.readFile(fp, "utf8");
  const out = clean(orig, stats);
  if (out !== orig) {
    changed++;
    if (dry) {
      console.log("✎", f);
    } else {
      await fs.writeFile(fp, out);
      console.log("✎", f);
    }
  } else {
    console.log("✓", f);
  }
}
console.log(
  `\n${files.length} 篇 | 改 ${changed} | v-for 展开 ${stats.expanded} 张` +
    (stats.skipped.length ? ` | ⚠️ 未识别 ${stats.skipped.length}` : "") +
    (dry ? " | DRY-RUN" : ""),
);
if (stats.skipped.length) stats.skipped.forEach((s) => console.log("  " + s));
