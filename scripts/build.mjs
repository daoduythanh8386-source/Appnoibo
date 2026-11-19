// Ghép giao diện thành thư mục www/ (dùng cho Netlify, Capacitor và Electron).
// Cần biến môi trường SUPABASE_URL và SUPABASE_ANON_KEY.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => path.join(root, 'src', f);
const out = path.join(root, 'www');
const E = process.env;
const url = E.SUPABASE_URL || E.NEXT_PUBLIC_SUPABASE_URL || E.VITE_SUPABASE_URL || '';
const key = E.SUPABASE_ANON_KEY || E.NEXT_PUBLIC_SUPABASE_ANON_KEY || E.VITE_SUPABASE_ANON_KEY || E.SUPABASE_KEY || '';
// Thiếu biến chỉ là thông báo, KHÔNG làm build thất bại: app sẽ hiện màn hình nhập kết nối Supabase ở lần mở đầu.
if (!url || !key) console.log('Thông báo: chưa đặt SUPABASE_URL / SUPABASE_ANON_KEY (Vercel: Settings → Environment Variables, tick Production + Preview, rồi Redeploy). Build vẫn tiếp tục.');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'vendor'), { recursive: true });
fs.mkdirSync(path.join(out, 'icons'), { recursive: true });

const nm = (p) => path.join(root, 'node_modules', p);
const vendor = {
  'xlsx.full.min.js': nm('xlsx/dist/xlsx.full.min.js'),
  'jsQR.js': nm('jsqr/dist/jsQR.js'),
  'qrcode.js': nm('qrcode-generator/qrcode.js'),
  'supabase.js': nm('@supabase/supabase-js/dist/umd/supabase.js'),
};
for (const [name, from] of Object.entries(vendor)) {
  if (!fs.existsSync(from)) throw new Error('Thiếu thư viện: ' + from + ' (chạy npm install trước)');
  fs.copyFileSync(from, path.join(out, 'vendor', name));
}
for (const f of fs.readdirSync(src('icons'))) fs.copyFileSync(path.join(src('icons'), f), path.join(out, 'icons', f));
fs.copyFileSync(src('manifest.webmanifest'), path.join(out, 'manifest.webmanifest'));
fs.copyFileSync(src('shim.js'), path.join(out, 'shim.js'));
fs.writeFileSync(path.join(out, 'config.js'), 'window.ORI_CONFIG=' + JSON.stringify({ url, key }) + ';\n');

let head = fs.readFileSync(src('a-head.html'), 'utf8');
head = head.replace(/<script src="https:\/\/cdnjs[^\n]*\n/g, '');
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#0b2447">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icons/icon-192.png">\n<link rel="apple-touch-icon" href="icons/icon-192.png">');
const libs = ['vendor/xlsx.full.min.js', 'vendor/jsQR.js', 'vendor/qrcode.js', 'vendor/supabase.js', 'config.js', 'shim.js']
  .map((s) => '<script src="' + s + '"></script>\n').join('');
head = head.replace(/<script>\s*$/, libs + '<script>\n');
let body = '';
for (const f of ['b1-core.js', 'b2-data.js', 'c-pages.js', 'c2-extra.js', 'd-app.js']) body += fs.readFileSync(src(f), 'utf8') + '\n';
if (!/<\/script>\s*$/.test(body)) body += '</script>\n';
if (!/<script>\n/.test(head.slice(-20))) throw new Error('Không tìm thấy thẻ <script> mở ở cuối a-head.html');
fs.writeFileSync(path.join(out, 'index.html'), head + body + '</body>\n</html>\n');
console.log('Đã tạo www/index.html');
