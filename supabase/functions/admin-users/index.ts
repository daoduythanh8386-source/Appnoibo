// Edge Function: quản trị viên tạo, khóa, xóa tài khoản và gửi mã OTP. Chạy bằng khóa service_role phía máy chủ.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!, svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const caller = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
    const admin = createClient(url, svc, { auth: { persistSession: false } });
    const { data: me } = await admin.from('profiles').select('role,disabled').eq('id', user.id).maybeSingle();
    if (!me || me.role !== 'admin' || me.disabled) return json({ error: 'Chỉ quản trị viên được thực hiện' }, 403);

    const b = await req.json();
    const email = String(b.email || '').trim().toLowerCase();
    const sendCode = async (to: string) => {
      const pub = createClient(url, anon, { auth: { persistSession: false } });
      const r = await pub.auth.resetPasswordForEmail(to);
      return r.error ? r.error.message : '';
    };

    if (b.action === 'create') {
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Email không hợp lệ' }, 400);
      const name = String(b.name || '').slice(0, 80);
      const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name } });
      if (error || !data.user) return json({ error: /already|registered/i.test(error?.message || '') ? 'Email này đã có tài khoản' : (error?.message || 'Không tạo được') }, 400);
      const ins = await admin.from('profiles').insert({ id: data.user.id, email, name, role: 'member' });
      if (ins.error) { await admin.auth.admin.deleteUser(data.user.id); return json({ error: ins.error.message }, 400); }
      const mailError = b.sendCode === false ? '' : await sendCode(email);
      return json({ uid: data.user.id, mailError });
    }
    if (b.action === 'sendCode') {
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Email không hợp lệ' }, 400);
      const e = await sendCode(email);
      return e ? json({ error: e }, 400) : json({ ok: true });
    }
    if (b.action === 'setDisabled') {
      const uid = String(b.uid || ''); if (uid === user.id) return json({ error: 'Không thể khóa chính mình' }, 400);
      await admin.from('profiles').update({ disabled: !!b.disabled }).eq('id', uid);
      await admin.auth.admin.updateUserById(uid, { ban_duration: b.disabled ? '876000h' : 'none' });
      return json({ ok: true });
    }
    if (b.action === 'setAdmin') {
      const uid = String(b.uid || ''); if (uid === user.id) return json({ error: 'Không thể đổi quyền chính mình' }, 400);
      await admin.from('profiles').update({ role: b.admin ? 'admin' : 'member' }).eq('id', uid);
      return json({ ok: true });
    }
    if (b.action === 'delete') {
      const uid = String(b.uid || ''); if (uid === user.id) return json({ error: 'Không thể xóa chính mình' }, 400);
      const { error } = await admin.auth.admin.deleteUser(uid);
      return error ? json({ error: error.message }, 400) : json({ ok: true });
    }
    return json({ error: 'Hành động không hợp lệ' }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
