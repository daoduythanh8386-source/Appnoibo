(function(){
'use strict';
const H=window.__HR,S=H.S,esc=H.esc,fmt=H.fmt,pill=H.pill;
const fv=(k,d)=>S.form[k]!=null?S.form[k]:(d==null?'':d);
const btn=(a,l,c,x)=>'<button class="btn'+(c?' '+c:'')+'" data-act="'+a+'"'+(x||'')+'>'+l+'</button>';
const card=(h)=>'<div class="card">'+h+'</div>';
const empty=(t,p)=>'<div class="card empty-state"><h3>'+esc(t)+'</h3><p class="muted">'+p+'</p></div>';
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== logo ORISTAR 3D ===== */
function faceSvg(){
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs>'+
  '<linearGradient id="og1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#e2a92b"/><stop offset="1" stop-color="#9a6a10"/></linearGradient>'+
  '<radialGradient id="og2" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#2f7fe0"/><stop offset=".6" stop-color="#0b3f86"/><stop offset="1" stop-color="#04183a"/></radialGradient>'+
  '<linearGradient id="og3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#7fd6ff"/></linearGradient></defs>'+
  '<circle cx="50" cy="50" r="50" fill="url(#og1)"/><circle cx="50" cy="50" r="44" fill="none" stroke="#fff6d0" stroke-opacity=".7" stroke-width="1.2"/>'+
  '<circle cx="50" cy="50" r="40" fill="url(#og2)"/>'+
  '<path d="M50 17l8.6 18.2 19.9 2.5-14.6 13.8 3.7 19.7L50 61.6 32.4 71.2l3.7-19.7L21.5 37.7l19.9-2.5z" fill="url(#og3)" stroke="#bfe9ff" stroke-width=".8" stroke-linejoin="round"/>'+
  '<text x="50" y="86" text-anchor="middle" font-family="Be Vietnam Pro,Arial,sans-serif" font-weight="700" font-size="9.5" letter-spacing="1.6" fill="#ffe9a8">ORISTAR</text>'+
  '<ellipse cx="38" cy="26" rx="22" ry="9" fill="#fff" opacity=".13" transform="rotate(-25 38 26)"/></svg>'}
function coin(px,k){
  const logo=S.settings&&S.settings.logo,face=logo?'<img alt="ORISTAR" src="'+esc(logo)+'">':faceSvg();
  let ly='';for(let z=-4;z<=4;z++)ly+='<i class="ly" style="transform:translateZ('+z+'px);background:'+(Math.abs(z)>2?'#d9a62e':'#a97a16')+'"></i>';
  return '<div class="stage" style="width:'+px+'px;height:'+px+'px"><div class="coin" data-k="'+(k||1)+'" style="width:'+px+'px;height:'+px+'px">'+ly+
   '<div class="f" style="transform:translateZ(5px)">'+face+'</div><div class="f bk" style="transform:rotateY(180deg) translateZ(5px)">'+face+'</div></div></div>'}
function spinLogo(){S.spin=performance.now()}
function tick(t){
  const els=document.querySelectorAll('.coin');
  if(els.length){
    let ex=0;if(S.spin){const p=Math.min(1,(t-S.spin)/1250);ex=(1-Math.pow(1-p,3))*720;if(p>=1)S.spin=0}
    els.forEach(el=>{
      const sway=reduce?0:Math.sin(t/1500)*20,fl=reduce?0:Math.sin(t/800)*3,tx=reduce?0:Math.cos(t/1900)*7;
      el.style.transform='translateY('+fl.toFixed(2)+'px) rotateX('+tx.toFixed(2)+'deg) rotateY('+(sway+ex).toFixed(2)+'deg)'})}
  requestAnimationFrame(tick)}
requestAnimationFrame(tick);

/* ===== vai trò ===== */
const ROLE_NAME={admin:'Quản trị viên',manager:'Quản lý',employee:'Nhân viên'};
const roleName=r=>ROLE_NAME[r]||ROLE_NAME.employee;

/* ===== chat ===== */
const EMO=('😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😎 🤩 🥳 😏 🤔 🤗 🤭 😴 😢 😭 😤 😡 😱 😳 🙄 😬 👍 👎 👌 ✌️ 🤝 🙏 👏 💪 👋 🤞 ❤️ 💙 💛 💚 🔥 ⭐ ✨ 🎉 🎂 🎁 ☕ 🍚 🍜 🍺 ✅ ❌ ⚠️ ❗ ❓ 💯 🕐 📌 📎 📷 📞 💻 🏭 🔧 🦺 📦 🚚').split(' ');
const GENERAL={id:'all',name:'Toàn nhà máy',members:'all'};
function visibleRooms(){
  const r=S.rooms.filter(x=>S.isAdmin||(x.members||[]).indexOf(S.uid)>=0).sort((a,b)=>(a.name||'').localeCompare(b.name||'','vi'));
  return [GENERAL].concat(r)}
const msgsOfRoom=id=>(S.msgs[id]||[]);
function dmThreads(){
  const m={};
  S.dms.forEach(x=>{const p=x.peer;if(!p)return;(m[p]=m[p]||[]).push(x)});
  return m}
function seenKey(k){return S.chat.seen[k]||0}
function lastOf(list){return list.length?list[list.length-1]:null}
function unreadOf(list){const s=0;return list.filter(x=>x.t>seenKey(x._k)&&x.from!==S.uid&&x.dir!=='out').length}
function convs(){
  const out=[];
  visibleRooms().forEach(r=>{const l=msgsOfRoom(r.id);out.push({key:'g:'+r.id,name:r.name,sub:r.id==='all'?'Tất cả thành viên':(r.members||[]).length+' thành viên',last:lastOf(l),list:l,group:true})});
  const th=dmThreads();
  Object.keys(th).forEach(p=>{const l=th[p].slice().sort((a,b)=>a.t-b.t);out.push({key:'d:'+p,name:H.nameDir(p),sub:'Nhắn riêng · không mã hóa',last:lastOf(l),list:l,group:false,peer:p})});
  return out}
function convUnread(c){const s=S.chat.seen[c.key]||0;return c.list.filter(x=>x.t>s&&x.from!==S.uid&&x.dir!=='out').length}
const dayLabel=t=>{const d=new Date(t);return H.pad(d.getDate())+'/'+H.pad(d.getMonth()+1)+'/'+d.getFullYear()};
const hm=t=>{const d=new Date(t);return H.pad(d.getHours())+':'+H.pad(d.getMinutes())};
function preview(m){if(!m)return 'Chưa có tin nhắn';const who=m.dir==='out'||m.from===S.uid?'Bạn: ':'';return who+(m.img&&!m.text?'[Hình ảnh]':(m.img?'[Hình ảnh] ':'')+m.text)}
function bubbles(c){
  if(!c)return '';
  let h='',last='';
  const total=c.list.length,canMore=c.group&&total>=S.chat.limit;
  if(canMore)h+='<div class="day"><button class="btn sm" data-act="chatMore">Xem tin cũ hơn</button></div>';
  c.list.forEach(m=>{
    const dl=dayLabel(m.t);if(dl!==last){h+='<div class="day">'+dl+'</div>';last=dl}
    const me=m.dir==='out'||m.from===S.uid;
    h+='<div class="msg'+(me?' me':'')+'">'+(c.group&&!me?'<span class="who2">'+esc(H.nameDir(m.from))+'</span>':'')+'<div class="bub">'+(m.img?'<img alt="Hình ảnh" src="'+esc(m.img)+'" data-act="chatZoom">':'')+(m.text?esc(m.text):'')+'</div><span class="meta">'+(c.group&&me?esc(S.name||'Bạn')+' · ':'')+hm(m.t)+'</span></div>'});
  return h||'<div class="day">Hãy gửi tin nhắn đầu tiên</div>'}
function pChat(){
  if(!S.uid)return empty('Cần đăng nhập','Đăng nhập tài khoản đã được cấp để dùng chat nội bộ.');
  const cs=convs(),q=H.norm(fv('cq'));
  const cur=cs.find(c=>c.key===S.chat.room)||(S.chat.room&&S.chat.room.indexOf('d:')===0?{key:S.chat.room,name:H.nameDir(S.chat.room.slice(2)),sub:'Tin nhắn riêng',list:[],group:false,peer:S.chat.room.slice(2)}:null);
  const shown=cs.filter(c=>!q||H.norm(c.name).indexOf(q)>=0).sort((a,b)=>(b.last?b.last.t:0)-(a.last?a.last.t:0));
  const people=q?Object.keys(S.dir).filter(u=>u!==S.uid&&H.norm(S.dir[u].name+S.dir[u].code).indexOf(q)>=0&&!cs.some(c=>c.peer===u)):[];
  const av=n=>'<span class="avatar">'+esc(H.initials(n))+'</span>';
  let list='<div class="hd"><input id="f_cq" data-f="cq" type="search" placeholder="Tìm người hoặc nhóm" value="'+esc(fv('cq'))+'" autocomplete="off" style="flex:1;min-width:0">'+btn('newRoom','+ Nhóm','sm')+'</div><div class="rows">'+
   shown.map(c=>{const u=convUnread(c);return '<button class="crow" data-act="chatOpen" data-r="'+esc(c.key)+'" aria-current="'+(S.chat.room===c.key)+'">'+av(c.name)+'<span class="tx"><b>'+esc(c.name)+'</b><span class="small muted">'+esc(preview(c.last))+'</span></span><span class="tm">'+(c.last?hm(c.last.t):'')+(u?'<br><span class="unread">'+u+'</span>':'')+'</span></button>'}).join('')+
   people.map(u=>'<button class="crow" data-act="chatOpen" data-r="d:'+esc(u)+'">'+av(S.dir[u].name)+'<span class="tx"><b>'+esc(S.dir[u].name)+'</b><span class="small muted">'+esc(S.dir[u].code||'')+' · nhắn tin riêng</span></span></button>').join('')+
   (!shown.length&&!people.length?'<div class="tbl-empty">Không tìm thấy.</div>':'')+'</div>';
  let conv;
  if(!cur)conv='<div class="conv" style="place-items:center;display:grid"><div class="muted" style="text-align:center;padding:20px">'+coin(84,1)+'<p style="margin-top:14px">Chọn một cuộc trò chuyện để bắt đầu</p></div></div>';
  else conv='<div class="conv"><div class="top"><button class="btn sm back" data-act="chatBack">‹</button>'+av(cur.name)+'<b>'+esc(cur.name)+'<br><span class="small muted" style="font-weight:400">'+esc(cur.sub)+'</span></b>'+(cur.group&&cur.key!=='g:all'?btn('roomMem','Thành viên','sm'):'')+(S.isAdmin&&cur.group?btn('chatExport','Lưu trữ','sm'):'')+'</div>'+
    '<div id="msgs">'+bubbles(cur)+'</div>'+(S.chat.emo?'<div class="emo">'+EMO.map(e=>'<button type="button" data-act="chatEmoji" data-e="'+e+'" aria-label="Biểu tượng '+e+'">'+e+'</button>').join('')+'</div>':'')+
    '<div class="composer"><button class="btn" data-act="chatEmo" aria-label="Chọn biểu tượng cảm xúc">😊</button><label class="btn" for="chatImg" aria-label="Gửi ảnh">🖼</label><input id="chatImg" type="file" accept="image/*" hidden><textarea id="f_chatText" data-f="chatText" rows="1" maxlength="2000" placeholder="Nhập tin nhắn…">'+esc(fv('chatText'))+'</textarea>'+btn('chatSend','Gửi','primary')+'</div></div>';
  return '<div class="chat'+(S.chat.open?' opened':'')+'"><div class="clist">'+list+'</div>'+conv+'</div>'+
   '<p class="hint" style="margin-top:8px">Tên người gửi lấy từ tên tài khoản. Tin nhắn được lưu lại trên hệ thống. Lưu ý: hệ thống không có máy chủ riêng nên tin nhắn, kể cả nhắn riêng, không được mã hóa; người có quyền truy cập dữ liệu có thể đọc. Không gửi mật khẩu hay thông tin nhạy cảm qua chat.</p>'}

/* ===== đồng bộ chat ===== */
function chatSync(){
  if(!S.db||!S.uid)return;
  const want={};
  visibleRooms().forEach(r=>{want['g:'+r.id]=(S.chat.room==='g:'+r.id)?S.chat.limit:30});
  Object.keys(want).forEach(k=>{
    const cur=S.subs[k];if(cur&&cur.limit===want[k])return;
    if(cur&&cur.un)try{cur.un()}catch(e){}
    const id=k.slice(2);
    const un=S.db.collection('chatmsg/'+id+'/m').orderBy('t','desc').limit(want[k]).onSnapshot(s=>{
      S.msgs[id]=s.docs.map(d=>Object.assign({_k:k,_id:d.id},d.data())).sort((a,b)=>a.t-b.t);H.render()},()=>{});
    S.subs[k]={limit:want[k],un:un}});
  Object.keys(S.subs).forEach(k=>{if(k.indexOf('g:')===0&&!want[k]){try{S.subs[k].un()}catch(e){}delete S.subs[k]}})}
function markSeen(){
  const k=S.chat.room;if(!k)return;const c=convs().find(x=>x.key===k);
  const t=c&&c.last?c.last.t:Date.now();
  if((S.chat.seen[k]||0)<t){S.chat.seen[k]=t;try{localStorage.setItem('ori-seen-'+S.uid,JSON.stringify(S.chat.seen))}catch(e){}}}
function loadSeen(){try{S.chat.seen=JSON.parse(localStorage.getItem('ori-seen-'+S.uid)||'{}')||{}}catch(e){S.chat.seen={}}}
function chatUnreadTotal(){try{return convs().reduce((n,c)=>n+(c.key===S.chat.room&&S.page==='chat'?0:convUnread(c)),0)}catch(e){return 0}}

/* ===== quản lý: nhân viên trực tiếp ===== */
function calStrip(st){
  const y=S.month.y,m=S.month.m;let h='<div style="display:flex;flex-wrap:wrap;gap:4px">';
  for(let d=1;d<=H.dim(y,m);d++){const i=H.dayInfo(y,m,d),c=H.effCode(st,i);
    h+='<div style="width:40px;text-align:center;border:1px solid var(--line);border-radius:6px;padding:2px 0;'+(i.off?'background:var(--hover);':'')+(i.hol?'border-color:#e0a21b;':'')+'"><div class="small muted">'+d+' · '+H.WD[(i.w+6)%7]+'</div><b>'+(H.SHOW[c]||'·')+'</b>'+(st.ot&&st.ot[i.s]&&st.ot[i.s].h?'<div class="otb">+'+esc(st.ot[i.s].h)+'h</div>':'')+'</div>'}
  return h+'</div>'}
function pTeam(){
  const list=S.team.slice().sort(H.byCode);
  const monthNavH='<div class="mnav"><button class="btn sm" data-act="mprev" aria-label="Tháng trước">‹</button><b>Tháng '+S.month.m+'/'+S.month.y+'</b><button class="btn sm" data-act="mnext" aria-label="Tháng sau">›</button></div>';
  if(!list.length)return empty('Chưa có nhân viên trực thuộc','Quản trị viên gán nhân viên cho bạn bằng trường Quản lý trực tiếp trong hồ sơ nhân viên.');
  const sel=list.find(s=>s._id===S.form.tm)||null;
  let h='<div class="stats"><div class="stat"><b>'+list.length+'</b><span>Nhân viên trực tiếp</span></div><div class="stat '+(list.some(s=>['bad','warn'].indexOf(H.contractState(s).k)>=0)?'warn':'ok')+'"><b>'+list.filter(s=>['bad','warn'].indexOf(H.contractState(s).k)>=0).length+'</b><span>Hợp đồng sắp hết hạn</span></div></div>';
  h+='<div class="card"><div class="tools" style="border:0;padding:0;background:none">'+monthNavH+'</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã</th><th>Họ tên</th><th>Bộ phận</th><th class="r">Công tháng</th><th class="r">Phép còn</th><th>Hợp đồng</th></tr></thead><tbody>'+
   list.map(s=>{const sm=H.summarize(s,S.month.y,S.month.m),l=H.leaveInfo(s,S.month.y),c=H.contractState(s);
    return '<tr data-act="teamPick" data-id="'+esc(s._id)+'"'+(sel&&sel._id===s._id?' style="background:var(--brand-soft)"':'')+'><td><b>'+esc(s.code)+'</b></td><td>'+esc(s.name)+(s.status==='left'?' '+pill('none','Đã nghỉ'):'')+'</td><td>'+esc(s.dept||'')+'</td><td class="r">'+sm.paid+' / '+sm.std+'</td><td class="r">'+l.left+'</td><td>'+pill(c.k,c.t)+'</td></tr>'}).join('')+'</tbody></table></div></div>';
  if(sel){const l=H.leaveInfo(sel,S.month.y),c=H.contractState(sel),sm=H.summarize(sel,S.month.y,S.month.m);
    h+=card('<h3>'+esc(sel.name)+' · '+esc(sel.code)+'</h3><p class="muted small" style="margin:4px 0 10px">'+esc(sel.title||'')+(sel.dept?' · '+esc(sel.dept):'')+' · '+esc(sel.phone||'')+' · '+esc(sel.email||'')+'</p>'+
     '<div class="line"><span>Hợp đồng</span><span>'+esc(sel.contractType||'')+' · hết hạn '+fmt(sel.contractEnd)+' '+pill(c.k,c.t)+'</span></div>'+
     '<div class="line"><span>Phép năm '+S.month.y+'</span><span>định mức <b>'+l.quota+'</b> · đã nghỉ <b>'+l.used+'</b> ('+l.runs+' đợt) · còn <b>'+l.left+'</b></span></div>'+
     '<div class="line"><span>Tháng '+S.month.m+'</span><span>làm '+sm.x+' ngày, nửa ngày '+sm.n+', phép '+sm.p+', ốm '+sm.o+', không lương '+sm.k+', lễ '+sm.l+', công tác ngoài '+sm.t+', tăng ca '+sm.ot+' giờ'+(sm.ot?' (quy đổi '+sm.otEq+')':'')+'</span></div>'+
     '<div style="margin-top:10px">'+calStrip(sel)+'</div><p class="small muted" style="margin-top:8px">X làm cả ngày, ½ nửa ngày, P phép, O ốm, K không lương, L công lễ, T công tác ngoài nhà máy, +h giờ tăng ca.</p>')}
  return h+'<p class="hint">Bạn chỉ thấy nhân viên được quản trị viên gán trực tiếp cho bạn. Dữ liệu được đồng bộ vài giây sau khi quản trị viên cập nhật.</p>'}

/* ===== bảo mật ===== */
const pinCfg=()=>{try{return JSON.parse(localStorage.getItem('ori-pin-'+S.uid)||'null')}catch(e){return null}};
function pSec(){
  const c=pinCfg(),r=H.role();
  let h=card('<h3 style="margin-bottom:8px">Tài khoản đăng nhập</h3><div class="line"><span>Tên hiển thị</span><span><b>'+esc(S.name||'—')+'</b></span></div><div class="line"><span>Vai trò</span><span>'+pill(r==='admin'?'bad':r==='manager'?'warn':'ok',roleName(r))+'</span></div>'+
   (S.myDoc?'<div class="line"><span>Mã nhân viên</span><span><b>'+esc(S.myDoc.code)+'</b></span></div>':'')+
   '<div class="tools" style="border:0;padding:10px 0 0;background:none">'+btn('signOut','Đăng xuất')+'</div>');
  h+=card('<h3 style="margin-bottom:8px">Đổi mật khẩu</h3><div class="grid2" style="max-width:520px"><div class="field"><label for="f_npw">Mật khẩu mới (từ 8 ký tự)</label><input id="f_npw" data-f="npw" type="password" autocomplete="new-password" value="'+esc(fv('npw'))+'"></div><div class="field"><label for="f_npw2">Nhập lại mật khẩu mới</label><input id="f_npw2" data-f="npw2" type="password" autocomplete="new-password" value="'+esc(fv('npw2'))+'"></div></div><div style="margin-top:10px">'+btn('pwChange','Đổi mật khẩu','primary')+'</div><p class="err">'+esc(S.form.pwErr||'')+'</p><p class="hint">Quên mật khẩu: đăng xuất, ở màn hình đăng nhập chọn lấy mã OTP, mã được gửi về email cá nhân đã đăng ký.</p>');
  h+=card('<h3 style="margin-bottom:8px">Khóa màn hình bằng mã PIN</h3><p class="muted" style="margin-bottom:10px">Tự khóa khi không thao tác, tránh người khác xem dữ liệu khi bạn rời máy. Mã PIN lưu riêng trên thiết bị này.</p>'+
   (c?'<div class="line"><span>Trạng thái</span><span>'+pill('ok','Đang bật · tự khóa sau '+c.min+' phút')+'</span></div><div class="tools" style="border:0;padding:10px 0 0;background:none">'+btn('lockNow','Khóa ngay','primary')+btn('pinOff','Tắt khóa PIN')+'</div>':
   '<div class="grid2" style="max-width:520px"><div class="field"><label for="f_pin1">Mã PIN mới (4 đến 8 số)</label><input id="f_pin1" data-f="pin1" type="password" inputmode="numeric" maxlength="8" autocomplete="off" value="'+esc(fv('pin1'))+'"></div><div class="field"><label for="f_pin2">Nhập lại mã PIN</label><input id="f_pin2" data-f="pin2" type="password" inputmode="numeric" maxlength="8" autocomplete="off" value="'+esc(fv('pin2'))+'"></div><div class="field"><label for="f_pmin">Tự khóa sau</label><select id="f_pmin" data-f="pmin">'+[1,3,5,10,15,30].map(n=>'<option value="'+n+'"'+(String(fv('pmin','5'))===String(n)?' selected':'')+'>'+n+' phút</option>').join('')+'</select></div></div><div style="margin-top:10px">'+btn('pinOn','Bật khóa PIN','primary')+'</div><p class="err">'+esc(S.form.pinErr||'')+'</p>'));
  h+=card('<h3 style="margin-bottom:8px">Nguyên tắc bảo mật của hệ thống</h3><ol class="steps"><li>Chỉ tài khoản do quản trị viên tạo bằng email cá nhân mới đăng nhập được. Phân quyền được kiểm soát ngay ở máy chủ dữ liệu, không chỉ ở giao diện.</li><li>Quản trị viên mới thêm, sửa, xóa nhân viên và tạo tài khoản quản lý. Nhân viên chỉ xem hồ sơ của mình, quản lý xem thêm nhân viên trực tiếp.</li><li>Mật khẩu của mỗi người do chính họ đặt qua mã OTP gửi về email cá nhân. Quản trị viên không biết mật khẩu.</li><li>Nhân viên nghỉ việc bị khóa đăng nhập ngay khi bấm Cho nghỉ việc hoặc xóa hồ sơ.</li><li>Mọi thao tác quan trọng của quản trị viên được ghi nhật ký.</li></ol>');
  return h}
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}

/* ===== nhật ký ===== */
function pAudit(){
  const rows=S.audit.slice().sort((a,b)=>b.at-a.at);
  if(!rows.length)return empty('Chưa có nhật ký','Các thao tác thêm, sửa, xóa nhân viên, cấp tài khoản và duyệt liên kết sẽ được ghi tại đây.');
  return '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Thời gian</th><th>Người thao tác</th><th>Hành động</th><th>Chi tiết</th></tr></thead><tbody>'+rows.map(a=>'<tr><td>'+H.fmtTs(a.at)+'</td><td>'+esc(a.byName||H.nameDir(a.by))+'</td><td><b>'+esc(a.act)+'</b></td><td>'+esc(a.detail||'')+'</td></tr>').join('')+'</tbody></table></div><div class="foot">'+rows.length+' dòng gần nhất</div></div>'}

/* ===== tài khoản (quản trị) ===== */
function pAccounts(){
  const q=H.norm(fv('q')),rows=S.staff.slice().sort(H.byCode).filter(s=>!q||H.norm(s.code+s.name+(s.dept||'')).indexOf(q)>=0);
  const mgr=code=>{const m=S.staff.find(s=>s.code===code);return m?m.name+' ('+m.code+')':(code||'—')};
  let h='<div class="tools">'+btn('newStaff','+ Tạo tài khoản nhân viên','primary')+'<span class="sp"></span><input id="f_q" data-f="q" type="search" placeholder="Tìm mã, tên, bộ phận" value="'+esc(fv('q'))+'" autocomplete="off"></div>';
  h+=rows.length?'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã</th><th>Họ tên</th><th>Quyền</th><th>Quản lý trực tiếp</th><th>Đăng nhập</th><th>Thao tác</th></tr></thead><tbody>'+rows.map(s=>{
    const rl=s.role==='manager'?'manager':'employee',left=s.status==='left';
    const acc=left?pill('none','Đã khóa'):(s.uid?pill('ok','Đã có tài khoản')+'<br><span class="small muted">'+esc(s.email||'')+'</span>':pill('bad','Chưa có tài khoản')+(s.email?'<br><span class="small muted">'+esc(s.email)+'</span>':''));
    return '<tr><td><b>'+esc(s.code)+'</b></td><td>'+esc(s.name)+'</td><td>'+pill(rl==='manager'?'warn':'ok',roleName(rl))+'</td><td>'+esc(mgr(s.managerCode))+'</td><td>'+acc+'</td><td><span class="tools" style="border:0;padding:0;background:none">'+btn('editStaff','Sửa','sm',' data-id="'+esc(s._id)+'"')+(!s.uid&&!left?btn('mkAcc','Tạo tài khoản','sm primary',' data-id="'+esc(s._id)+'"'):'')+(s.uid&&!left?btn('sendOtp','Gửi mã OTP','sm',' data-id="'+esc(s._id)+'"'):'')+(!left?btn('setLeft','Cho nghỉ việc','sm',' data-id="'+esc(s._id)+'"'):btn('setActive','Cho làm lại','sm',' data-id="'+esc(s._id)+'"'))+'</span></td></tr>'}).join('')+'</tbody></table></div><div class="foot">'+rows.length+' hồ sơ</div>':'<div class="tbl-empty">Chưa có tài khoản.</div>';
  h+=card('<h3 style="margin-bottom:8px">Quy trình cấp tài khoản</h3><ol class="steps"><li>Bấm Tạo tài khoản nhân viên, nhập mã, họ tên, <b>email cá nhân</b>, chọn quyền (Nhân viên hoặc Quản lý) và quản lý trực tiếp.</li><li>Hệ thống tạo tài khoản và gửi mã OTP về email cá nhân đó. Nhân viên mở ứng dụng, chọn Lần đầu đăng nhập, nhập email, mã OTP và đặt mật khẩu của riêng mình.</li><li>Quên mật khẩu: nhân viên tự lấy lại mã OTP trên màn hình đăng nhập, hoặc bạn bấm Gửi mã OTP.</li><li>Nghỉ việc: bấm Cho nghỉ việc để khóa đăng nhập ngay, hoặc xóa hồ sơ trong mục Sửa để xóa luôn tài khoản.</li></ol>');
  return h}

/* ===== kiểm kê kho ===== */
function pStocktake(){
  const kho=fv('kKho','all'),its=S.items.slice().sort(H.byCode).filter(i=>kho==='all'||i.kho===kho),sm=H.stockMap();
  let h=card('<h3 style="margin-bottom:8px">Kiểm kê thực tế</h3><p class="muted small" style="margin-bottom:10px">Đếm hàng thực tế, nhập số đếm được vào cột Thực đếm. Hệ thống so với sổ sách, tự tạo phiếu điều chỉnh cho dòng chênh lệch sau khi có ảnh và chữ ký của người kiểm kê và người chứng kiến.</p><div class="grid2">'+
   '<div class="field"><label for="f_kKho">Kho kiểm kê</label><select id="f_kKho" data-f="kKho">'+[['all','Tất cả kho']].concat(H.KHO.map(k=>[k,k])).map(o=>'<option value="'+esc(o[0])+'"'+(kho===o[0]?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></div>'+
   '<div class="field"><label for="f_kDate">Ngày kiểm kê</label><input id="f_kDate" data-f="kDate" type="date" value="'+esc(fv('kDate',H.todayStr()))+'"></div>'+
   '<div class="field"><label for="f_kCounter">Người kiểm kê</label><input id="f_kCounter" data-f="kCounter" maxlength="80" value="'+esc(fv('kCounter',S.name||''))+'"></div>'+
   '<div class="field"><label for="f_kWitness">Người chứng kiến *</label><input id="f_kWitness" data-f="kWitness" maxlength="80" value="'+esc(fv('kWitness'))+'"></div>'+
   H.photoBox('kPhotos','Ảnh kiểm kê thực tế * (tối đa 4 ảnh)',true)+'</div>');
  h+=its.length?'<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã</th><th>Vật tư</th><th>Kho</th><th class="r">Sổ sách</th><th class="r">Thực đếm</th><th class="r">Chênh lệch</th></tr></thead><tbody>'+its.map(i=>{
    const book=sm[i.code]||0,v=S.form['cnt_'+i.code],has=v!==undefined&&v!==''&&!isNaN(Number(v)),d=has?Math.round((Number(v)-book)*1000)/1000:null;
    return '<tr><td><b>'+esc(i.code)+'</b></td><td>'+esc(i.name)+'</td><td>'+esc(i.kho||'')+'</td><td class="r"><span class="num">'+book+'</span> '+esc(i.unit||'')+'</td><td class="r"><input id="f_cnt_'+esc(i.code)+'" data-f="cnt_'+esc(i.code)+'" type="number" step="any" min="0" inputmode="decimal" style="width:92px;text-align:right" value="'+esc(v==null?'':v)+'" aria-label="Thực đếm '+esc(i.code)+'"></td><td class="r">'+(has?(d===0?pill('ok','Khớp'):pill('warn',(d>0?'+':'')+d)):'<span class="muted small">Chưa đếm</span>')+'</td></tr>'}).join('')+'</tbody></table></div><div class="foot">'+its.length+' vật tư</div><div class="tools" style="border:0;padding:10px 0 0;background:none">'+btn('ktDone','Hoàn tất, ký xác nhận','primary')+btn('ktClear','Xóa số đã nhập')+'</div></div>':empty('Chưa có vật tư','Kho này chưa có vật tư trong danh mục.');
  const hist=S.stocktakes.slice().sort((a,b)=>b.at-a.at).slice(0,50);
  h+='<div class="card"><h3 style="margin-bottom:8px">Lịch sử kiểm kê</h3>'+(hist.length?'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ngày</th><th>Kho</th><th>Người kiểm kê</th><th>Chứng kiến</th><th class="r">Số dòng</th><th class="r">Chênh lệch</th><th></th></tr></thead><tbody>'+hist.map(k=>{const dd=(k.lines||[]).filter(l=>l.diff!==0).length;return '<tr><td>'+fmt(k.date)+'</td><td>'+esc(k.kho==='all'?'Tất cả kho':k.kho)+'</td><td>'+esc(k.counter)+'</td><td>'+esc(k.witness)+'</td><td class="r">'+(k.lines||[]).length+'</td><td class="r">'+(dd?pill('warn',dd+' dòng'):pill('ok','Khớp'))+(k.applied?'':' '+pill('bad','Chưa điều chỉnh xong'))+'</td><td class="r">'+btn('viewKK','Xem chi tiết','sm',' data-id="'+esc(k._id)+'"')+'</td></tr>'}).join('')+'</tbody></table></div>':'<p class="muted">Chưa có đợt kiểm kê nào.</p>')+'</div>';
  return h}

/* ===== bảng phối hợp liên bộ phận ===== */
const DEPTS=['QC','Kinh doanh','Sản xuất','Kho','HCNS / Kế toán','Ban giám đốc'];
const BT={request:'Yêu cầu',defect:'Lỗi / không phù hợp chất lượng',incident:'Sự cố phát sinh',info:'Thông báo'};
const BS={new:['Mới','warn'],doing:['Đang xử lý','note'],done:['Đã xử lý, chờ xác nhận','ok'],closed:['Đã đóng','none']};
const BV={normal:['Thường','none'],urgent:['Khẩn','warn'],critical:['Nghiêm trọng','bad']};
const BNEXT={new:[['doing','Nhận xử lý','primary'],['closed','Đóng phiếu','']],doing:[['done','Báo đã xử lý xong','primary'],['closed','Đóng phiếu','']],done:[['closed','Xác nhận và đóng','primary'],['doing','Chưa đạt, xử lý lại','']],closed:[['doing','Mở lại phiếu','']]};
function myDept(){
  if(S.isAdmin)return 'Ban giám đốc';
  const d=H.norm((S.myDoc&&S.myDoc.dept)||'');
  const hit=DEPTS.find(x=>d&&d.indexOf(H.norm(x.split(/[ /]/)[0]))>=0);return hit||DEPTS[0]}
function bseenLoad(){
  try{S.bseen=JSON.parse(localStorage.getItem('ori-bseen-'+S.uid)||'{}')||{}}catch(e){S.bseen={}}
  try{let b=Number(localStorage.getItem('ori-bbase-'+S.uid));if(!b){b=Date.now();localStorage.setItem('ori-bbase-'+S.uid,String(b))}S.bbase=b}catch(e){S.bbase=Date.now()}}
const boardUnread=()=>S.board.filter(t=>t.last!==S.uid&&t.upd>Math.max(S.bbase,S.bseen[t._id]||0)).length;
function boardSeen(){const id=S.form.bt;if(!id)return;const t=S.board.find(x=>x._id===id);
  if(t&&(S.bseen[id]||0)<t.upd){S.bseen[id]=t.upd;try{localStorage.setItem('ori-bseen-'+S.uid,JSON.stringify(S.bseen))}catch(e){}}}
function boardNew(){
  const to=S.form.bTo||[];
  return card('<div class="sec-h"><h3>Tạo phiếu mới</h3></div><div class="grid2">'+
   '<div class="field"><label for="f_bType">Loại phiếu</label><select id="f_bType" data-f="bType">'+Object.keys(BT).map(k=>'<option value="'+k+'"'+(fv('bType','request')===k?' selected':'')+'>'+BT[k]+'</option>').join('')+'</select></div>'+
   '<div class="field"><label for="f_bSev">Mức độ</label><select id="f_bSev" data-f="bSev">'+Object.keys(BV).map(k=>'<option value="'+k+'"'+(fv('bSev','normal')===k?' selected':'')+'>'+BV[k][0]+'</option>').join('')+'</select></div>'+
   '<div class="field"><label for="f_bFrom">Bộ phận gửi</label><select id="f_bFrom" data-f="bFrom">'+DEPTS.map(d=>'<option'+(fv('bFrom',myDept())===d?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></div>'+
   '<div class="field"><label>Gửi đến bộ phận *</label><div style="display:flex;flex-wrap:wrap;gap:4px 14px">'+DEPTS.map(d=>'<label class="chk"><input type="checkbox" data-act="bTo" data-k="'+esc(d)+'"'+(to.indexOf(d)>=0?' checked':'')+'> '+esc(d)+'</label>').join('')+'</div></div>'+
   '<div class="field" style="grid-column:1/-1"><label for="f_bTitle">Tiêu đề *</label><input id="f_bTitle" data-f="bTitle" maxlength="120" placeholder="Ví dụ: Lô áo 2411-A lỗi đường may vai" value="'+esc(fv('bTitle'))+'"></div>'+
   '<div class="field"><label for="f_bRef">Đơn hàng, lô, mã sản phẩm, máy liên quan</label><input id="f_bRef" data-f="bRef" maxlength="80" value="'+esc(fv('bRef'))+'"></div>'+
   '<div class="field"><label for="f_bQty">Số lượng bị ảnh hưởng</label><input id="f_bQty" data-f="bQty" maxlength="40" placeholder="Ví dụ: 120 cái" value="'+esc(fv('bQty'))+'"></div>'+
   '<div class="field" style="grid-column:1/-1"><label for="f_bBody">Nội dung, mô tả chi tiết</label><textarea id="f_bBody" data-f="bBody" rows="4" maxlength="2000" style="width:100%;font-family:var(--f-body)">'+esc(fv('bBody'))+'</textarea></div>'+
   H.photoBox('bPhotos','Ảnh đính kèm (tối đa 3 ảnh)',true)+'</div><div class="tools" style="border:0;padding:10px 0 0;background:none">'+btn('bCreate','Gửi phiếu','primary')+btn('bCancel','Hủy')+'</div>')}
function boardRow(t){
  const st=BS[t.status]||BS.new,sv=BV[t.sev]||BV.normal,unread=t.last!==S.uid&&t.upd>Math.max(S.bbase,S.bseen[t._id]||0);
  return '<tr data-act="bOpen" data-id="'+esc(t._id)+'"><td style="white-space:nowrap"><b>'+esc(t.code||'')+'</b><br><span class="small muted">'+fmt(new Date(t.at).toISOString().slice(0,10))+'</span></td><td>'+esc(BT[t.type]||'')+'</td><td class="wrapc">'+(unread?'<span class="unread" style="margin:0 6px 0 0">mới</span>':'')+'<b>'+esc(t.title)+'</b>'+(t.ref?'<br><span class="small muted">'+esc(t.ref)+'</span>':'')+'</td><td class="wrapc">'+esc(t.from||'')+' → '+esc((t.to||[]).join(', '))+'</td><td>'+pill(sv[1],sv[0])+'</td><td>'+pill(st[1],st[0])+'</td><td class="small muted" style="white-space:nowrap">'+H.fmtTs(t.upd)+'<br>'+(t.n||0)+' trao đổi</td></tr>'}
function boardDetail(t){
  const st=BS[t.status]||BS.new,sv=BV[t.sev]||BV.normal,msgs=S.bmsgs[t._id]||[],imgs=S.bimg[t._id]||[];
  let h='<div class="tools" style="border:0;padding:0 0 10px;background:none">'+btn('bBack','‹ Danh sách')+'</div>';
  h+=card('<div class="sec-h"><div><h3 style="margin-bottom:4px">'+esc(t.title)+'</h3><span class="small muted">'+esc(t.code||'')+' · '+esc(BT[t.type]||'')+'</span></div><span>'+pill(sv[1],sv[0])+' '+pill(st[1],st[0])+'</span></div>'+
   '<div class="line"><span>Người tạo</span><span>'+esc(H.nameDir(t.by))+' · '+H.fmtTs(t.at)+'</span></div><div class="line"><span>Từ bộ phận</span><span>'+esc(t.from||'—')+'</span></div><div class="line"><span>Gửi đến</span><span>'+esc((t.to||[]).join(', ')||'—')+'</span></div>'+
   (t.ref?'<div class="line"><span>Liên quan</span><span>'+esc(t.ref)+'</span></div>':'')+(t.qty?'<div class="line"><span>Số lượng ảnh hưởng</span><span>'+esc(t.qty)+'</span></div>':'')+
   (t.body?'<p style="margin-top:10px;white-space:pre-wrap;overflow-wrap:anywhere">'+esc(t.body)+'</p>':'')+
   (t.photos?(imgs.length?'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'+imgs.map(p=>'<img alt="Ảnh đính kèm" data-act="chatZoom" src="'+esc(p)+'" style="height:110px;border-radius:8px;cursor:zoom-in;border:1px solid var(--line)">').join('')+'</div>':'<p class="small muted" style="margin-top:10px">Đang tải ảnh…</p>'):'')+
   '<div class="tools" style="border:0;padding:12px 0 0;background:none">'+(BNEXT[t.status]||[]).map(n=>btn('bStatus',n[1],n[2],' data-s="'+n[0]+'"')).join('')+'</div>');
  h+='<div class="conv" style="height:min(60vh,520px);border:1px solid var(--line);border-radius:6px;margin-top:14px;background:var(--surface)"><div class="top"><b>Trao đổi và lịch sử xử lý</b></div><div id="msgs">'+
   (msgs.length?msgs.map(m=>{
     if(m.sys)return '<div class="day">'+esc(H.nameDir(m.from))+': '+esc(m.text)+' · '+H.fmtTs(m.t)+'</div>';
     const me=m.from===S.uid;
     return '<div class="msg'+(me?' me':'')+'">'+(me?'':'<span class="who2">'+esc(H.nameDir(m.from))+'</span>')+'<div class="bub">'+(m.img?'<img alt="Hình ảnh" data-act="chatZoom" src="'+esc(m.img)+'">':'')+(m.text?esc(m.text):'')+'</div><span class="meta">'+H.fmtTs(m.t)+'</span></div>'}).join(''):'<div class="day">Chưa có trao đổi</div>')+
   '</div><div class="composer"><label class="btn" for="ev_bcPhoto" aria-label="Đính kèm ảnh">🖼</label><input id="ev_bcPhoto" data-ev="bcPhoto" type="file" accept="image/*" hidden><textarea id="f_bText" data-f="bText" rows="1" maxlength="1500" placeholder="Nhập trao đổi, cập nhật xử lý…">'+esc(fv('bText'))+'</textarea>'+btn('bSend','Gửi','primary')+'</div>'+
   (S.form.bcPhoto?'<div style="padding:6px 10px;border-top:1px solid var(--line)"><img alt="Ảnh sẽ gửi" src="'+esc(S.form.bcPhoto)+'" style="height:48px;border-radius:6px;vertical-align:middle"> '+btn('evClear','Bỏ ảnh','sm',' data-k="bcPhoto"')+'</div>':'')+'</div>';
  return h}
function pBoard(){
  const open=S.form.bt&&S.board.find(t=>t._id===S.form.bt);
  if(open)return boardDetail(open);
  const q=H.norm(fv('q')),fd=fv('bfDept','all'),ft=fv('bfType','all'),fs=fv('bfStatus','open'),fv2=fv('bfSev','all');
  const rows=S.board.filter(t=>(fd==='all'||t.from===fd||(t.to||[]).indexOf(fd)>=0)&&(ft==='all'||t.type===ft)&&(fv2==='all'||t.sev===fv2)&&(fs==='all'?true:fs==='open'?t.status!=='closed':t.status===fs)&&(!q||H.norm(t.title+(t.ref||'')+(t.body||'')+(t.code||'')).indexOf(q)>=0)).sort((a,b)=>b.upd-a.upd);
  const cnt=k=>S.board.filter(t=>t.status===k).length,urgent=S.board.filter(t=>t.status!=='closed'&&t.sev!=='normal').length;
  const so=(k,l,list,cur)=>'<select id="f_'+k+'" data-f="'+k+'" aria-label="'+l+'">'+list.map(o=>'<option value="'+esc(o[0])+'"'+(cur===o[0]?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';
  let h='<div class="stats"><div class="stat '+(cnt('new')?'warn':'ok')+'"><b>'+cnt('new')+'</b><span>Phiếu mới</span></div><div class="stat"><b>'+cnt('doing')+'</b><span>Đang xử lý</span></div><div class="stat"><b>'+cnt('done')+'</b><span>Chờ xác nhận</span></div><div class="stat '+(urgent?'bad':'ok')+'"><b>'+urgent+'</b><span>Khẩn, nghiêm trọng đang mở</span></div></div>';
  if(S.form.bnew)h+=boardNew();
  h+='<div class="tools">'+btn('bNew','+ Tạo phiếu','primary')+btn('bExport','Xuất Excel lưu trữ')+'<span class="sp"></span>'+
    so('bfDept','Bộ phận',[['all','Mọi bộ phận']].concat(DEPTS.map(d=>[d,d])),fd)+so('bfType','Loại',[['all','Mọi loại']].concat(Object.keys(BT).map(k=>[k,BT[k]])),ft)+so('bfSev','Mức độ',[['all','Mọi mức độ']].concat(Object.keys(BV).map(k=>[k,BV[k][0]])),fv2)+
    so('bfStatus','Trạng thái',[['open','Đang mở'],['all','Tất cả (cả đã đóng)'],['new','Mới'],['doing','Đang xử lý'],['done','Chờ xác nhận'],['closed','Đã đóng']],fs)+
    '<input id="f_q" data-f="q" type="search" placeholder="Tìm tiêu đề, mã lô, nội dung" value="'+esc(fv('q'))+'" autocomplete="off"></div>';
  h+=rows.length?'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã phiếu</th><th>Loại</th><th>Tiêu đề</th><th>Từ → đến</th><th>Mức độ</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>'+rows.slice(0,200).map(boardRow).join('')+'</tbody></table></div><div class="foot">'+rows.length+' phiếu'+(rows.length>200?' (hiển thị 200 phiếu mới nhất)':'')+'. Phiếu không bao giờ bị xóa, chỉ đóng và lưu lại để tra cứu.</div>':'<div class="tbl-empty">'+(S.board.length?'Không có phiếu khớp bộ lọc.':'Chưa có phiếu nào. Bấm Tạo phiếu để gửi yêu cầu hoặc báo lỗi cho bộ phận khác.')+'</div>';
  return h}

H.EXTRA={board:pBoard,stocktake:pStocktake,chat:pChat,team:pTeam,sec:pSec,audit:pAudit,acc:pAccounts};
Object.assign(H,{boardUnread:boardUnread,boardSeen:boardSeen,bseenLoad:bseenLoad,BT:BT,BS:BS,BV:BV,DEPTS:DEPTS,coin:coin,spinLogo:spinLogo,chatSync:chatSync,markSeen:markSeen,loadSeen:loadSeen,chatUnreadTotal:chatUnreadTotal,visibleRooms:visibleRooms,roleName:roleName,pinCfg:pinCfg,sha:sha,EMO:EMO,convs:convs,GENERAL:GENERAL});
})();
