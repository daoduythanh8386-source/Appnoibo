# ORISTAR – Quản trị nội bộ (bản độc lập)

Web (Netlify) + Android APK + Windows EXE + iOS, dùng chung một mã nguồn. Dữ liệu và đăng nhập chạy trên **Supabase**:
tài khoản bằng **email cá nhân**, mật khẩu do từng người tự đặt qua **mã OTP gửi về email**, phân quyền được ép ở máy chủ.

## Bước 1. Tạo máy chủ dữ liệu (Supabase)
1. Vào supabase.com, tạo dự án mới (chọn vùng Singapore).
2. **SQL Editor** > dán toàn bộ `supabase/schema.sql` > Run.
3. **Authentication > Users > Add user**: nhập email và mật khẩu của bạn, tick *Auto Confirm User*. Sau đó chạy trong SQL Editor (đổi email):
   `insert into public.profiles(id,email,name,role) select id,email,'Quản trị viên','admin' from auth.users where email='email-cua-ban@gmail.com' on conflict (id) do update set role='admin';`
4. **Gửi email OTP** (bắt buộc làm, nếu không nhân viên không nhận được mã):
   - **Authentication > Emails > Templates > Reset Password**: sửa nội dung thành có dòng `Mã OTP của bạn: {{ .Token }}`.
   - **Authentication > Emails > SMTP Settings**: bật SMTP riêng (ví dụ Gmail với mật khẩu ứng dụng, hoặc Resend/Brevo). Máy chủ gửi mặc định của Supabase chỉ cho vài email mỗi giờ.
   - **Authentication > Sign In / Providers > Email**: bật *Confirm email*, giữ độ dài mật khẩu tối thiểu 8.
5. **Hàm tạo tài khoản** (Edge Function): cài Supabase CLI rồi chạy
   `supabase login`, `supabase link --project-ref <ref>`, `supabase functions deploy admin-users`.
6. **Project Settings > API**: lấy `Project URL` và `anon public key` (hai giá trị này được phép công khai; **không** dùng khóa `service_role` trong ứng dụng).

## Bước 2. Đưa mã lên GitHub
Thư mục này đã là một kho git có sẵn một commit. Tạo kho riêng tư **trống** trên github.com (không tick thêm README), rồi chạy trong thư mục này:
```
git remote add origin https://github.com/TEN-CUA-BAN/oristar-noi-bo.git
git push -u origin main
```
Tạo kho riêng tư (private), đẩy toàn bộ thư mục này lên. Vào **Settings > Secrets and variables > Actions** thêm hai secret:
`SUPABASE_URL` và `SUPABASE_ANON_KEY`.

## Bước 3. Web trên Netlify
Netlify > Add new site > Import from Git > chọn kho. Lệnh build và thư mục xuất bản đã có trong `netlify.toml`.
Thêm hai biến môi trường `SUPABASE_URL`, `SUPABASE_ANON_KEY` rồi Deploy. Mở trang trên điện thoại, chọn *Thêm vào màn hình chính* để dùng như ứng dụng.

## Bước 4. Build ứng dụng
Trong GitHub: tab **Actions** > chọn quy trình > **Run workflow**. Kết quả ở mục *Artifacts* của lần chạy.
- **Android APK** (`android.yml`): tải `app-debug.apk`, cài trực tiếp (bật cài từ nguồn ngoài). Đưa lên Google Play cần ký bản phát hành bằng khóa riêng của bạn.
- **Windows EXE** (`windows.yml`): tải bộ cài `.exe`. Windows có thể cảnh báo SmartScreen vì chưa ký số.
- **iOS** (`ios.yml`): mặc định chỉ build cho trình giả lập để kiểm tra. Cài lên iPhone hoặc TestFlight bắt buộc có **Apple Developer (99 USD/năm)**, chứng chỉ và provisioning profile; cần bổ sung bước ký vào quy trình.

## Dùng hằng ngày
- Quản trị viên: **Tài khoản và phân quyền > Tạo tài khoản nhân viên**, nhập email cá nhân và chọn quyền (Nhân viên / Quản lý, quản lý trực tiếp). Hệ thống gửi mã OTP về email đó.
- Nhân viên: mở ứng dụng > *Lần đầu đăng nhập hoặc quên mật khẩu* > nhập email > nhập mã OTP > đặt mật khẩu.
- Nghỉ việc: *Cho nghỉ việc* khóa đăng nhập ngay; xóa hồ sơ sẽ xóa luôn tài khoản.

## Bảo mật và giới hạn
- Quyền đọc/ghi nằm trong bảng `rules` và hàm `rule_ok` của `schema.sql`, áp bằng Row Level Security: nhân viên chỉ đọc hồ sơ của mình, quản lý đọc nhân viên trực tiếp qua bản sao do quản trị viên đồng bộ, chỉ quản trị viên ghi hồ sơ nhân sự.
- Tin nhắn chat (kể cả nhắn riêng) **mọi tài khoản đăng nhập đều đọc được về mặt kỹ thuật** và không mã hóa đầu cuối. Ảnh chat nằm ở kho công khai theo đường dẫn khó đoán, tối đa 5 MB.
- Tính năng đồng bộ Google Sheets chỉ có trong bản chạy trong Claude; bản này dùng nhập/xuất Excel và CSV.
- Khóa PIN màn hình lưu trên từng thiết bị, chỉ là lớp ngăn người ngoài xem lén.
- Kho tối đa 1000 bản ghi mỗi bộ sưu tập khi tải; nếu vượt (hơn 1000 vật tư hay giao dịch kho) cần bổ sung phân trang.

## Khắc phục lỗi thường gặp khi deploy Netlify

- **"Không tìm thấy thư mục đầu ra" (Publish directory not found):** `netlify.toml` phải nằm ở thư mục gốc của repo (cùng cấp với `package.json`), không nằm trong thư mục con. Khi push lên GitHub, hãy push *nội dung* bên trong thư mục `oristar`, không push thư mục cha. Trong Netlify: Build command = `npm install --omit=dev --ignore-scripts && node scripts/build.mjs`, Publish directory = `www`, Base directory để trống.
- **Cảnh báo thiếu SUPABASE_URL / SUPABASE_ANON_KEY:** đặt 2 biến này ở Site configuration → Environment variables rồi Deploy lại. Nếu chưa đặt, ứng dụng vẫn build và sẽ hiện màn hình nhập URL + khoá Supabase ở lần mở đầu tiên.

## Triển khai trên Vercel

1. Import repo vào Vercel. **Root Directory phải là thư mục chứa `package.json` và `vercel.json`** (nếu bạn push thư mục `oristar/` lồng bên trong repo, hãy đặt Root Directory = `oristar`). Framework Preset: *Other*.
2. `vercel.json` đã đặt sẵn: Install `npm install --omit=dev --ignore-scripts`, Build `node scripts/build.mjs`, Output Directory `www`.
3. Settings → Environment Variables: thêm `SUPABASE_URL` và `SUPABASE_ANON_KEY` (tick Production + Preview), rồi Redeploy. (Cũng nhận `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.) Thiếu biến chỉ là thông báo, app vẫn build và sẽ hiện màn hình nhập kết nối ở lần mở đầu.
