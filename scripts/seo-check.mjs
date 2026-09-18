import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/onesgym\.jp\/(.*?)<\/loc>/g)].map(m => m[1] || 'index.html');
const failures = [];

for (const relative of urls) {
  const file = relative === '' ? 'index.html' : relative;
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { failures.push(`${file}: sitemap target is missing`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim() || '';
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
  if (!title || title.length > 65) failures.push(`${file}: title is missing or longer than 65 characters`);
  if (!description || description.length < 50 || description.length > 180) failures.push(`${file}: meta description must be 50–180 characters`);
  if (!canonical.startsWith('https://onesgym.jp/')) failures.push(`${file}: canonical URL is missing or invalid`);
  if (!/<h1(?:\s|>)/i.test(html)) failures.push(`${file}: H1 is missing`);
  for (const match of html.matchAll(/href="([^"]+\.html)(?:#[^"]*)?"/g)) {
    const target = match[1];
    if (/^https?:/.test(target)) continue;
    if (!fs.existsSync(path.join(root, target))) failures.push(`${file}: broken internal link ${target}`);
  }
}

for (const required of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
  if (!fs.existsSync(path.join(root, required))) failures.push(`${required}: required discovery file is missing`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`SEO checks passed for ${urls.length} indexable pages.`);
