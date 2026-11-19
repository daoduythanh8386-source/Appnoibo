/* Lớp tương thích: cho ứng dụng chạy độc lập trên Supabase (đăng nhập email + mật khẩu / mã OTP).
   Cung cấp window.claude.use('db'|'user'|'downloads'|'assets'|'mcp') với cùng giao diện mà mã ứng dụng đang dùng. */
(function(){
'use strict';
let cfg=window.ORI_CONFIG||{};
if(!cfg.url||!cfg.key){try{const sv=JSON.parse(localStorage.getItem('ORI_CFG')||'null');if(sv&&sv.url&&sv.key)cfg=sv}catch(e){}}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!window.supabase||!cfg.url||!cfg.key){
  window.claude={use:async()=>null};
  window.addEventListener('DOMContentLoaded',()=>{const a=document.getElementById('app');if(!a)return;
    a.innerHTML='<div style="max-width:440px;margin:8vh auto;padding:24px;font-family:sans-serif;display:grid;gap:10px"><h2 style="margin:0">Kết nối Supabase</h2><p style="margin:0;color:#555;font-size:.92rem">Bản build này chưa có biến SUPABASE_URL / SUPABASE_ANON_KEY. Dán thông tin dự án Supabase (Project Settings → API) vào đây một lần; thiết bị sẽ ghi nhớ. Cách làm một lần cho tất cả thiết bị: đặt 2 biến SUPABASE_URL và SUPABASE_ANON_KEY trong Vercel (Settings → Environment Variables, tick Production) hoặc Netlify rồi Redeploy.</p><input id="cfu" placeholder="https://xxxx.supabase.co" style="padding:10px;font-size:1rem"><input id="cfk" placeholder="anon public key" style="padding:10px;font-size:1rem"><button id="cfb" style="padding:12px;font-size:1rem;font-weight:700">Lưu và mở ứng dụng</button><div id="cfm" style="color:#b00020;min-height:1.2em"></div></div>';
    document.getElementById('cfb').onclick=()=>{const u=document.getElementById('cfu').value.trim().replace(/\/+$/,''),k=document.getElementById('cfk').value.trim();
      if(!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(u)||k.length<30){document.getElementById('cfm').textContent='URL hoặc khoá chưa đúng định dạng.';return}
      try{localStorage.setItem('ORI_CFG',JSON.stringify({url:u,key:k}))}catch(e){document.getElementById('cfm').textContent='Không lưu được trên trình duyệt này.';return}
      location.reload()}});
  return}
const sb=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let me=null,prof=null;

/* ===== màn hình đăng nhập ===== */
function authUI(){return new Promise(resolve=>{
  const el=document.createElement('div');el.id='auth';
  el.style.cssText='position:fixed;inset:0;z-index:95;background:radial-gradient(circle at 30% 20%,#12407f,#06152b 70%);display:grid;place-items:center;padding:20px;overflow:auto';
  document.body.appendChild(el);
  let mode='login',email='',msg='',busy=false;
  const logo=()=>window.__HR&&window.__HR.coin?window.__HR.coin(110,1):'';
  const draw=()=>{
    const f=(id,l,t,ph,ac)=>'<label for="'+id+'" style="text-align:left;font-size:.85rem;color:#b9d3ee">'+l+'</label><input id="'+id+'" type="'+t+'" placeholder="'+(ph||'')+'" autocomplete="'+(ac||'off')+'" style="width:100%">';
    let body='';
    if(mode==='login')body=f('au_e','Email cá nhân','email','ten@gmail.com','username')+f('au_p','Mật khẩu','password','','current-password')+'<button class="btn primary" data-a="login" style="width:100%">Đăng nhập</button><button class="btn" data-a="toReset" style="width:100%">Lần đầu đăng nhập hoặc quên mật khẩu</button>';
    else if(mode==='reset1')body='<p style="margin:0;color:#b9d3ee;font-size:.9rem">Nhập email cá nhân đã được quản trị viên đăng ký. Hệ thống gửi mã OTP về email đó.</p>'+f('au_e','Email cá nhân','email','ten@gmail.com','username')+'<button class="btn primary" data-a="sendOtp" style="width:100%">Gửi mã OTP</button><button class="btn" data-a="toLogin" style="width:100%">Quay lại</button>';
    else body='<p style="margin:0;color:#b9d3ee;font-size:.9rem">Mã OTP đã gửi tới <b>'+esc(email)+'</b>. Nhập mã và đặt mật khẩu mới.</p>'+f('au_o','Mã OTP trong email','text','','one-time-code')+f('au_p','Mật khẩu mới (từ 8 ký tự)','password','','new-password')+f('au_p2','Nhập lại mật khẩu mới','password','','new-password')+'<button class="btn primary" data-a="setPw" style="width:100%">Xác nhận và đăng nhập</button><button class="btn" data-a="toReset" style="width:100%">Gửi lại mã</button>';
    el.innerHTML='<div style="width:min(380px,100%);color:#dbe9f7;display:grid;gap:10px;justify-items:center;text-align:center">'+logo()+'<div class="wordmark" style="font-size:1.7rem">ORISTAR</div><div style="opacity:.75;font-size:.85rem;margin-bottom:4px">Hệ thống quản trị nội bộ</div><form style="width:100%;display:grid;gap:8px" id="au_f">'+body+'</form><div id="au_m" role="alert" style="min-height:1.3em;color:#ffb4a8;font-size:.9rem">'+esc(msg)+'</div><div class="credit dark">APP Nội Bộ được làm bởi <b>Đào Duy Thanh</b> <span class="cc">c</span> since 2026</div></div>';
    const ee=el.querySelector('#au_e');if(ee){ee.value=email;}
    const first=el.querySelector('input');if(first&&!/Android|iPhone/i.test(navigator.userAgent))first.focus()};
  const val=id=>{const n=el.querySelector('#'+id);return n?n.value.trim():''};
  const say=m=>{msg=m;const n=el.querySelector('#au_m');if(n)n.textContent=m};
  const act=async a=>{
    if(busy)return;busy=true;say('');
    try{
      if(a==='toReset'){email=val('au_e')||email;mode='reset1';busy=false;draw();return}
      if(a==='toLogin'){mode='login';busy=false;draw();return}
      if(a==='login'){email=val('au_e').toLowerCase();const r=await sb.auth.signInWithPassword({email:email,password:el.querySelector('#au_p').value});
        if(r.error)say(/Invalid login/i.test(r.error.message)?'Email hoặc mật khẩu chưa đúng. Nếu là lần đầu hoặc quên mật khẩu, hãy chọn lấy mã OTP.':r.error.message)}
      else if(a==='sendOtp'){email=val('au_e').toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)){say('Email chưa hợp lệ.');busy=false;return}
        const r=await sb.auth.resetPasswordForEmail(email);if(r.error)say('Chưa gửi được mã: '+r.error.message);else{mode='reset2';busy=false;draw();return}}
      else if(a==='setPw'){const o=val('au_o'),p=el.querySelector('#au_p').value,p2=el.querySelector('#au_p2').value;
        if(p.length<8)say('Mật khẩu cần từ 8 ký tự.');else if(p!==p2)say('Hai lần nhập mật khẩu chưa khớp.');else{
          const v=await sb.auth.verifyOtp({email:email,token:o,type:'recovery'});
          if(v.error)say('Mã OTP sai hoặc đã hết hạn.');else{const u=await sb.auth.updateUser({password:p});if(u.error)say(u.error.message)}}}
    }catch(e){say('Lỗi kết nối, hãy thử lại.')}
    busy=false;
    const s=(await sb.auth.getSession()).data.session;if(s){el.remove();resolve(s)}};
  el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b){e.preventDefault();act(b.dataset.a)}});
  el.addEventListener('submit',e=>{e.preventDefault();act(mode==='login'?'login':mode==='reset1'?'sendOtp':'setPw')});
  draw()})}

async function ensureSession(){
  let s=(await sb.auth.getSession()).data.session;
  for(;;){
    if(!s)s=await authUI();
    me=s.user;
    const r=await sb.from('profiles').select('id,name,email,role,disabled').eq('id',me.id).maybeSingle();
    prof=r.data;
    if(prof&&!prof.disabled)return;
    await sb.auth.signOut();s=null;
    alert(prof&&prof.disabled?'Tài khoản đã bị khóa. Liên hệ quản trị viên.':'Tài khoản chưa được cấp quyền sử dụng. Liên hệ quản trị viên.')}}
let ready=null;const gate=()=>ready||(ready=ensureSession());
sb.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'){location.reload()}});

/* ===== kho tài liệu ===== */
const clone=o=>JSON.parse(JSON.stringify(o));
const idOf=p=>p.slice(p.lastIndexOf('/')+1),collOf=p=>p.slice(0,p.lastIndexOf('/'));
const subs=new Set();let chan=null,timer=0;
function ensureChan(){
  if(chan)return;
  chan=sb.channel('docs-all').on('postgres_changes',{event:'*',schema:'public',table:'docs'},p=>{
    const row=p.new&&p.new.coll?p.new:p.old;const c=row&&row.coll;
    subs.forEach(s=>{if(!c||s.coll===c)s.dirty=true});
    clearTimeout(timer);timer=setTimeout(()=>subs.forEach(s=>{if(s.dirty)s.run()}),150)}).subscribe()}
const ORD={t:1,at:1};
const wrap=r=>({id:r.id,exists:true,version:r.ver,data:()=>clone(r.data)});
function query(coll,opt){opt=opt||{};
  const run=async()=>{
    let q=sb.from('docs').select('id,data,ver').eq('coll',coll);
    if(opt.order&&ORD[opt.order]){q=q.order('ord',{ascending:opt.dir!=='desc',nullsFirst:false})}else q=q.order('id');
    q=q.limit(opt.limit||1000);
    const r=await q;if(r.error)throw r.error;return r.data.map(wrap)};
  const api={
    orderBy(f,d){return query(coll,Object.assign({},opt,{order:f,dir:d||'asc'}))},
    limit(n){return query(coll,Object.assign({},opt,{limit:n}))},
    async get(){const d=await run();return{docs:d,empty:!d.length,size:d.length}},
    onSnapshot(ok,err){
      const s={coll:coll,dirty:true,dead:false,run:async()=>{s.dirty=false;try{await gate();const d=await run();if(!s.dead)ok({docs:d,empty:!d.length,size:d.length})}catch(e){if(!s.dead&&err)err(fail(e))}}};
      subs.add(s);ensureChan();s.run();return()=>{s.dead=true;subs.delete(s)}},
    doc(id){return docRef(coll+'/'+id)}};
  return api}
function fail(e){const m=String((e&&e.message)||e||'');const x=new Error(m);
  x.code=/row-level security|permission|42501|JWT|403/i.test(m)?'invalid_argument':(/too many|rate/i.test(m)?'resource_exhausted':'unknown');return x}
function docRef(path){const coll=collOf(path),id=idOf(path);
  const read=async()=>{const r=await sb.from('docs').select('id,data,ver').eq('path',path).maybeSingle();if(r.error)throw fail(r.error);return r.data};
  return{
    async get(){await gate();const r=await read();return r?wrap(r):{id:id,exists:false,data:()=>undefined}},
    async set(d){await gate();const r=await sb.from('docs').upsert({path:path,coll:coll,id:id,data:d},{onConflict:'path'});if(r.error)throw fail(r.error)},
    async update(patch){await gate();const r=await sb.rpc('merge_doc',{p:path,patch:patch});if(r.error)throw fail(r.error)},
    async delete(){await gate();const r=await sb.from('docs').delete().eq('path',path);if(r.error)throw fail(r.error)},
    onSnapshot(ok,err){
      const s={coll:coll,dirty:true,dead:false,run:async()=>{s.dirty=false;try{await gate();const r=await read();if(!s.dead)ok(r?wrap(r):{id:id,exists:false,data:()=>undefined})}catch(e){if(!s.dead&&err)err(e)}}};
      subs.add(s);ensureChan();s.run();return()=>{s.dead=true;subs.delete(s)}}}}
const db={collection:p=>query(p),doc:p=>docRef(p)};

/* ===== người dùng, tải xuống, ảnh ===== */
const user={
  isOwner:()=>!!(prof&&prof.role==='admin'),canEdit:async()=>!!(prof&&prof.role==='admin'),can:()=>true,
  id:async()=>me.id,
  me:async()=>({id:me.id,name:(prof&&prof.name)||me.email,email:me.email}),
  profiles:async ids=>{const o={};const r=await sb.from('profiles').select('id,name,email').in('id',ids);(r.data||[]).forEach(p=>{o[p.id]={name:p.name||'',email:p.email,guest:false}});return o}};
const downloads={save:async({filename,data})=>{
  const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}};
const assets={upload:async blob=>{
  if(blob.size>5*1024*1024)throw new Error('Tệp vượt quá 5 MB');
  const ext=(blob.type.split('/')[1]||'bin').replace(/[^a-z0-9]/gi,'').slice(0,5),id=(crypto.randomUUID?crypto.randomUUID():Date.now()+''+Math.random()).replace(/-/g,'');
  const path=me.id+'/'+id+'.'+ext,r=await sb.storage.from('chat').upload(path,blob,{contentType:blob.type,upsert:false});
  if(r.error)throw r.error;return{id:path,url:sb.storage.from('chat').getPublicUrl(path).data.publicUrl,sizeBytes:blob.size,contentType:blob.type}}};

/* ===== quản lý tài khoản (qua Edge Function, chỉ quản trị viên) ===== */
async function adminUsers(action,payload){
  await gate();const r=await sb.functions.invoke('admin-users',{body:Object.assign({action:action},payload||{})});
  if(r.error){let m=r.error.message;try{const j=await r.error.context.json();if(j&&j.error)m=j.error}catch(e){}throw new Error(m)}
  return r.data}
window.ORI={adminUsers:adminUsers,signOut:()=>sb.auth.signOut(),changePassword:async p=>{const r=await sb.auth.updateUser({password:p});if(r.error)throw r.error}};

window.claude={use:async name=>{
  if(name==='db'){await gate();return db}
  if(name==='user'){await gate();return user}
  if(name==='downloads')return downloads;
  if(name==='assets'){await gate();return assets}
  return null}};
})();
