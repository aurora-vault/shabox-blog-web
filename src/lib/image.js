/**
 * 图片分层工具(shabox-blog-web)
 *
 * 原则:后端只存/返回原图 URL(与存储解耦),前端按展示场景加 BOS 图片
 * 处理参数,实现缩略/封面/正文/原图分层(类似阿里云 OSS 的自适应压缩)。
 *
 * BOS 图片处理:URL 加 ?x-bce-process=image/resize,w_<宽>,m_lfit
 *   - 只缩放、不裁切、不变形(m_lfit 限定最长边,保持比例)
 *   - 只对 img.shabox.fun 托管的图生效;外链 / 相对路径原样返回
 *
 * 复用:纯函数、无业务耦合。其它业务复用时改 BOS_HOST 即可
 *       (如 xingyu 用 img.xingyu.pro)。
 */

const BOS_HOST = "img.shabox.fun";
const PROCESS_KEY = "x-bce-process";
const RESIZE_MODE = "m_lfit"; // 限定最长边,保持比例

/** 语义档位:展示场景 → 宽度(px)。取原图时不传 size。 */
export const IMAGE_SIZE = Object.freeze({
  THUMB: 200, // 相册墙 / 列表小图
  COVER: 480, // 封面 / 卡片
  CONTENT: 1080, // 正文(最大渲染宽度)
});

/** 是否为我们托管的 BOS 图(才加处理参数) */
function isManaged(src) {
  return typeof src === "string" && src.includes(`://${BOS_HOST}`);
}

/**
 * 按档位返回处理后的 URL。
 * @param {string} src 原图 URL
 * @param {number} size IMAGE_SIZE 档位或具体宽度(px);null/0 返回原图
 * @returns {string}
 */
export function imgUrl(src, size) {
  if (!src || !isManaged(src) || !size) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}${PROCESS_KEY}=image/resize,w_${size},${RESIZE_MODE}`;
}

/**
 * 生成响应式 srcset,配合 <img srcset> 按视口自适应加载合适尺寸。
 * @param {string} src 原图 URL
 * @param {number[]} widths 宽度数组,如 [IMAGE_SIZE.THUMB, IMAGE_SIZE.COVER]
 * @returns {string} "url 200w, url 480w"(非托管图返回 "")
 */
export function imgSrcset(src, widths = []) {
  if (!src || !isManaged(src) || !Array.isArray(widths) || !widths.length) {
    return "";
  }
  return widths.map((w) => `${imgUrl(src, w)} ${w}w`).join(", ");
}
