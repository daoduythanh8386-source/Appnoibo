(function(){
'use strict';
const H=window.__HR,S=H.S,esc=H.esc,fmt=H.fmt,pill=H.pill,$=H.$;
const fv=(k,d)=>S.form[k]!=null?S.form[k]:(d==null?'':d);
const btn=(a,l,c,x)=>'<button class="btn'+(c?' '+c:'')+'" data-act="'+a+'"'+(x||'')+'>'+l+'</button>';
const sp='<span class="sp"></span>';
const tools=h=>'<div class="tools">'+h+'</div>';
const search=(ph)=>'<input id="f_q" data-f="q" type="search" placeholder="'+ph+'" value="'+esc(fv('q'))+'" autocomplete="off">';
function tbl(cols,rows,rowAttr,empty){
  if(!rows.length)return '<div class="tbl-empty">'+empty+'</div>';
  const cap=rows.length>400?rows.slice(0,400):rows;
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+cols.map(c=>'<th'+(c.cls?' class="'+c.cls+'"':'')+'>'+c.h+'</th>').join('')+'</tr></thead><tbody>'+
    cap.map(r=>'<tr'+(rowAttr?' '+rowAttr(r):'')+'>'+cols.map(c=>'<td'+(c.cls?' class="'+c.cls+'"':'')+'>'+c.f(r)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+
    '<div class="foot">'+rows.length+' bản ghi'+(rows.length>400?' (hiển thị 400 dòng đầu, hãy lọc để xem thêm)':'')+'</div>'}
const avatar=(s,lg)=>s&&s.photo?'<img class="avatar'+(lg?' lg':'')+'" alt="" src="'+esc(s.photo)+'">':'<span class="avatar'+(lg?' lg':'')+'">'+esc(H.initials(s&&s.name))+'</span>';
const card=(h,x)=>'<div class="card"'+(x||'')+'>'+h+'</div>';
const empty=(t,p,x)=>'<div class="card empty-state"><h3>'+esc(t)+'</h3><p class="muted">'+p+'</p>'+(x||'')+'</div>';
const fld=(k,l,t,d,x)=>'<div class="field"><label for="f_'+k+'">'+l+'</label><input id="f_'+k+'" data-f="'+k+'" type="'+(t||'text')+'" value="'+esc(fv(k,d))+'" '+(x||'')+'></div>';
const sel=(k,l,opts,d)=>'<div class="field"><label for="f_'+k+'">'+l+'</label><select id="f_'+k+'" data-f="'+k+'">'+opts.map(o=>{const v=Array.isArray(o)?o[0]:o,t=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(String(fv(k,d))===String(v)?' selected':'')+'>'+esc(t)+'</option>'}).join('')+'</select></div>';
function monthNav(){return '<div class="mnav"><button class="btn sm" data-act="mprev" aria-label="Tháng trước">‹</button><b>Tháng '+S.month.m+'/'+S.month.y+'</b><button class="btn sm" data-act="mnext" aria-label="Tháng sau">›</button></div>'}
function yearNav(){return '<div class="mnav"><button class="btn sm" data-act="yprev" aria-label="Năm trước">‹</button><b>Năm '+S.year+'</b><button class="btn sm" data-act="ynext" aria-label="Năm sau">›</button></div>'}
const activeStaff=()=>S.staff.filter(s=>s.status!=='left').sort(H.byCode);

/* ===== khung và điều hướng ===== */
const NAV_ADMIN=[
 ['','',[['home','Tổng quan'],['board','Bảng phối hợp'],['chat','Chat nội bộ']]],
 ['Nhân sự','',[['staff','Hồ sơ nhân viên'],['att','Chấm công'],['leave','Nghỉ phép năm'],['contract','Hợp đồng lao động'],['hol','Công lễ và lịch làm việc'],['acc','Tài khoản và phân quyền']]],
 ['Tài sản','',[['assets','Danh mục tài sản'],['scan','Kiểm tra vị trí'],['locs','Vị trí và nhãn QR']]],
 ['Kho','',[['items','Danh mục vật tư'],['stock','Nhập, xuất kho'],['stocktake','Kiểm kê kho'],['issue','Cấp phát và ký nhận']]],
 ['Hệ thống','',[['reports','Báo cáo'],['import','Nhập dữ liệu'],['audit','Nhật ký hoạt động'],['sec','Bảo mật']]]];
const NAV_EMP=[['','',[['me','Hồ sơ của tôi'],['myatt','Ngày công'],['myissue','Cấp phát của tôi'],['scan','Quét tài sản'],['board','Bảng phối hợp'],['chat','Chat nội bộ'],['sec','Bảo mật']]]];
const NAV_MGR=[['','',[['me','Hồ sơ của tôi'],['team','Nhân viên của tôi'],['myatt','Ngày công'],['myissue','Cấp phát của tôi'],['scan','Quét tài sản'],['board','Bảng phối hợp'],['chat','Chat nội bộ'],['sec','Bảo mật']]]];
const TITLES={board:'Bảng phối hợp liên bộ phận',stocktake:'Kiểm kê kho',chat:'Chat nội bộ',team:'Nhân viên của tôi',sec:'Bảo mật tài khoản',audit:'Nhật ký hoạt động',home:'Tổng quan',staff:'Hồ sơ nhân viên',att:'Chấm công',leave:'Nghỉ phép năm',contract:'Hợp đồng lao động',hol:'Công lễ và lịch làm việc',acc:'Tài khoản và phân quyền',assets:'Danh mục tài sản',scan:'Kiểm tra vị trí tài sản',locs:'Vị trí và nhãn QR',items:'Danh mục vật tư',stock:'Nhập, xuất kho',issue:'Cấp phát và ký nhận',reports:'Báo cáo',import:'Nhập dữ liệu',me:'Hồ sơ của tôi',myatt:'Ngày công của tôi',myissue:'Cấp phát của tôi'};
function badgeFor(p){
  if(p==='board'){const n=H.boardUnread?H.boardUnread():0;return n?'<span class="badge">'+n+'</span>':''}
  if(p==='chat'){const n=H.chatUnreadTotal?H.chatUnreadTotal():0;return n?'<span class="badge">'+n+'</span>':''}
  if(p==='acc'&&S.claims.length)return '<span class="badge">'+S.claims.length+'</span>';
  if(p==='issue'){const n=S.issues.filter(i=>!H.issSigned(i)).length;return n?'<span class="badge">'+n+'</span>':''}
  if(p==='myissue'){const n=S.myIssues.filter(i=>!S.mySigns[i._id]&&i.status!=='signed').length;return n?'<span class="badge">'+n+'</span>':''}
  return ''}
const BRAND=()=>'<div class="brand"><div class="brandrow">'+H.coin(46,1)+'<div><div class="wordmark">ORISTAR</div><span class="sub">Quản trị nội bộ</span></div></div></div>';
function navHtml(){
  const r=H.role(),groups=r==='admin'?NAV_ADMIN:(r==='manager'?NAV_MGR:NAV_EMP);
  return BRAND()+groups.map(g=>(g[0]?'<div class="grp">'+g[0]+'</div>':'')+g[2].map(it=>'<button class="mi" data-act="nav" data-p="'+it[0]+'" aria-current="'+(S.page===it[0])+'"><span>'+it[1]+'</span>'+badgeFor(it[0])+'</button>').join('')).join('')}
function pageHtml(){
  if(S.fatal)return empty('Chưa mở được dữ liệu',S.fatal);
  if(!S.ready)return empty('Đang tải dữ liệu',S.slow?'Chưa kết nối được kho dữ liệu. Kiểm tra mạng, trang sẽ tự cập nhật khi kết nối lại.':'Vui lòng chờ trong giây lát.');
  if(!S.isAdmin&&S.myDoc&&S.myDoc.status==='left')return empty('Tài khoản đã bị khóa','Hồ sơ của bạn đã được chuyển sang trạng thái nghỉ việc nên không còn quyền xem dữ liệu. Liên hệ bộ phận nhân sự nếu có nhầm lẫn.');
  const EX=H.EXTRA||{};
  if(EX[S.page]&&(S.isAdmin||['chat','sec','board'].indexOf(S.page)>=0||(S.page==='team'&&H.role()==='manager')))return EX[S.page]();
  const P=S.isAdmin?{home:pHome,staff:pStaff,att:pAtt,leave:pLeave,contract:pContract,hol:pHol,acc:pAcc,assets:pAssets,scan:pScan,locs:pLocs,items:pItems,stock:pStock,issue:pIssue,reports:pReports,import:pImport}:{me:pMe,myatt:pMyAtt,myissue:pMyIssue,scan:pScan};
  return (P[S.page]||(S.isAdmin?pHome:pMe))()}
function render(){
  const app=$('#app');if(!app)return;
  if(!S.isAdmin&&['home','staff'].indexOf(S.page)>=0)S.page='me';
  const ms0=document.getElementById('msgs'),msTop=ms0?ms0.scrollTop:0,msBot=ms0?(ms0.scrollHeight-ms0.scrollTop-ms0.clientHeight<80):true,msN=ms0?ms0.childElementCount:0;
  const ae=document.activeElement,aid=ae&&ae.id&&app.contains(ae)?ae.id:null,ss=aid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  const pg=document.getElementById('page'),y=window.scrollY,ps=pg?pg.scrollTop:0;
  app.innerHTML='<aside id="nav" class="'+(S.navOpen?'open':'')+'">'+(S.ready?navHtml():BRAND())+'</aside>'+
   '<div id="main"><div class="bar"><button id="burger" data-act="burger" aria-label="Mở menu">Menu</button>'+H.coin(34,1)+'<h1>'+esc(TITLES[S.page]||'Tổng quan')+'</h1><span class="who">'+esc(S.name||'')+(S.ready?' · '+H.roleName(H.role()):'')+'</span></div><div id="page" class="'+(S.anim?'pg-in':'')+'">'+pageHtml()+'</div>'+'<div class="credit">APP Nội Bộ được làm bởi <b>Đào Duy Thanh</b> <span class="cc" aria-label="bản quyền">c</span> since 2026</div>'+'</div>';
  $('#scrim').className='scrim'+(S.navOpen?' on':'');
  window.scrollTo(0,y);S.anim=false;
  const ms1=document.getElementById('msgs');if(ms1){ms1.scrollTop=(msBot||!ms0||S.chat.snap)?ms1.scrollHeight:msTop;S.chat.snap=false}
  if(S.page==='chat'&&H.markSeen)H.markSeen();
  if(S.page==='board'&&H.boardSeen)H.boardSeen();
  if(aid){const n=document.getElementById(aid);if(n){n.focus();if(ss&&n.setSelectionRange)try{n.setSelectionRange(ss[0],ss[1])}catch(e){}}}
}
H.render=render;

/* ===== tổng quan ===== */
function pHome(){
  const act=activeStaff(),al=act.map(s=>({s:s,c:H.contractState(s)})).filter(x=>x.c.k==='bad'||x.c.k==='warn'||x.c.k==='note').sort((a,b)=>a.c.d-b.c.d);
  const wrong=S.assets.filter(a=>H.assetState(a).k==='bad'),sm=H.stockMap(),low=S.items.filter(i=>i.min!==''&&i.min!=null&&(sm[i.code]||0)<=Number(i.min));
  const pend=S.issues.filter(i=>!H.issSigned(i)),ups=H.upcomingHolidays(4);
  let h='<div class="stats"><div class="stat"><b>'+act.length+'</b><span>Nhân viên đang làm</span></div>'+
   '<div class="stat '+(al.length?'warn':'ok')+'"><b>'+al.length+'</b><span>Hợp đồng cần xử lý</span></div>'+
   '<div class="stat '+(wrong.length?'bad':'ok')+'"><b>'+wrong.length+'</b><span>Tài sản sai chỗ</span></div>'+
   '<div class="stat '+(low.length?'warn':'ok')+'"><b>'+low.length+'</b><span>Vật tư dưới mức tối thiểu</span></div>'+
   '<div class="stat '+(pend.length?'warn':'ok')+'"><b>'+pend.length+'</b><span>Phiếu cấp phát chờ ký</span></div></div><div class="cols">';
  h+=card('<div class="sec-h"><h3>Hợp đồng đến hạn</h3><span class="small muted">Báo trước 60 ngày</span></div>'+(al.length?al.slice(0,8).map(x=>'<div class="alert '+x.c.k+'"><div class="t"><b>'+esc(x.s.name)+' · '+esc(x.s.code)+'</b><span class="small">'+esc(x.s.contractType||'')+' · hết hạn '+fmt(x.s.contractEnd)+'</span></div>'+pill(x.c.k,x.c.t)+'</div>').join(''):'<p class="muted">'+(act.length?'Không có hợp đồng nào hết hạn trong 60 ngày tới.':'Chưa có nhân viên. Vào Hồ sơ nhân viên để thêm hoặc nhập từ Excel.')+'</p>'));
  h+=card('<div class="sec-h"><h3>Tài sản sai chỗ</h3>'+btn('nav','Kiểm tra vị trí','sm',' data-p="scan"')+'</div>'+(wrong.length?wrong.slice(0,8).map(a=>'<div class="alert bad"><div class="t"><b>'+esc(a.code+' · '+a.name)+'</b><span class="small">Đang ở '+esc(H.locName(S.scans[a._id].loc))+'. Cần đưa về '+esc(H.locName(a.expectedLoc))+'</span></div></div>').join(''):'<p class="muted">'+(S.assets.length?'Chưa phát hiện tài sản nào sai chỗ.':'Chưa có tài sản nào trong danh mục.')+'</p>'));
  h+=card('<div class="sec-h"><h3>Vật tư sắp hết</h3></div>'+(low.length?low.slice(0,8).map(i=>'<div class="line"><span>'+esc(i.code+' · '+i.name)+'</span><span><b>'+(sm[i.code]||0)+'</b> '+esc(i.unit||'')+' (tối thiểu '+esc(i.min)+')</span></div>').join(''):'<p class="muted">Tồn kho đang trên mức tối thiểu.</p>'));
  h+=card('<div class="sec-h"><h3>Công lễ sắp tới</h3></div>'+(ups.length?ups.map(u=>'<div class="line"><span>'+fmt(u.date)+'</span><span><b>'+esc(u.name)+'</b> · '+(u.days===0?'hôm nay':'còn '+u.days+' ngày')+'</span></div>').join(''):'<p class="muted">Chưa nhập công lễ. Vào Công lễ và lịch làm việc để thêm.</p>'));
  return h+'</div>'}

/* ===== nhân viên ===== */
function pStaff(){
  const q=fv('q').toLowerCase(),sm=S.year;
  const rows=S.staff.slice().sort(H.byCode).filter(s=>!q||(s.name+' '+s.code+' '+(s.dept||'')+' '+(s.hometown||'')+' '+(s.email||'')).toLowerCase().indexOf(q)>=0);
  const cols=[{h:'Ảnh',f:s=>avatar(s)},{h:'Mã NV',f:s=>'<b>'+esc(s.code)+'</b>'},{h:'Họ và tên',f:s=>esc(s.name)},{h:'Phòng ban',f:s=>esc(s.dept||'')},{h:'Chức danh',f:s=>esc(s.title||'')},{h:'Quê quán',f:s=>esc(s.hometown||'')},{h:'Email cá nhân',f:s=>esc(s.email||'')},
   {h:'Hạn hợp đồng',f:s=>/không xác định/i.test(s.contractType||'')?'Không thời hạn':fmt(s.contractEnd)},{h:'Còn lại',f:s=>{const c=s.status==='left'?{k:'none',t:'Đã nghỉ việc'}:H.contractState(s);return pill(c.k,c.t)}},
   {h:'Phép còn ('+sm+')',cls:'r',f:s=>{const l=H.leaveInfo(s,sm);return '<span class="num">'+l.left+' / '+l.quota+'</span>'}},{h:'Tài khoản',f:s=>s.uid?pill('ok','Đã liên kết'):pill('none','Chưa')}];
  return tools(btn('newStaff','+ Thêm nhân viên','primary')+btn('goImport','Nhập từ Excel / dữ liệu thô')+btn('xEnt','Xuất Excel',null,' data-e="staff"')+sp+search('Tìm tên, mã, phòng ban, quê quán, email'))+
   tbl(cols,rows,s=>'data-act="editStaff" data-id="'+esc(s._id)+'"',S.staff.length?'Không có kết quả khớp.':'Chưa có hồ sơ nhân viên. Bấm Thêm nhân viên hoặc Nhập từ Excel.')}

/* ===== chấm công ===== */
function brushBar(){return '<div class="brush" role="group" aria-label="Loại công">'+['X','N','P','O','K','T','OT',''].map(k=>'<button class="chip '+(k?'c'+k:'cE')+'" data-act="brush" data-k="'+k+'" aria-pressed="'+(S.brush===k)+'" title="'+(k==='OT'?'Tăng ca, làm thêm giờ':k?H.CODES[k]:'Xóa')+'">'+(k==='OT'?'Tăng ca':k?H.SHOW[k]:'Xóa')+'</button>').join('')+'</div>'}
function legend(){return '<div class="legend">'+['X','N','P','O','K','L','T'].map(k=>'<span><i class="c'+k+'">'+H.SHOW[k]+'</i>'+H.CODES[k]+'</span>').join('')+'<span><i class="cOT">+h</i>Tăng ca, làm thêm giờ (số giờ)</span></div>'}
function calHtml(st,interactive){
  const y=S.month.y,m=S.month.m,n=H.dim(y,m),first=(H.dow(y,m,1)+6)%7,t=H.todayStr();
  let h='<div class="cal">'+H.WD.map(w=>'<div class="wd">'+w+'</div>').join('');
  for(let i=0;i<first;i++)h+='<div class="cell empty"></div>';
  for(let d=1;d<=n;d++){const i=H.dayInfo(y,m,d),c=H.effCode(st,i),tag=interactive?'button':'div';
    h+='<'+tag+' class="cell'+(i.off?' off':'')+(i.hol?' hol':'')+(i.s===t?' today':'')+'"'+(interactive?' data-act="mcell" data-e="'+esc(st._id)+'" data-d="'+i.s+'"':'')+(i.hol?' title="'+esc(i.hol.name)+'"':(st.out&&st.out[i.s]&&st.out[i.s].place?' title="Công tác: '+esc(st.out[i.s].place)+'"':''))+'><span class="dn">'+d+'</span><span class="cd'+(c?' c'+c:'')+'">'+(H.SHOW[c]||'&nbsp;')+'</span>'+(st.ot&&st.ot[i.s]&&st.ot[i.s].h?'<span class="otb">+'+esc(st.ot[i.s].h)+'h</span>':'')+'</'+tag+'>'}
  return h+'</div>'+legend()}
function sumTiles(st){
  const y=S.month.y,m=S.month.m,r=H.summarize(st,y,m),l=H.leaveInfo(st,y),t=(b,x)=>'<div class="stat"><b>'+b+'</b><span>'+x+'</span></div>';
  return '<div class="stats">'+t(r.paid+' / '+r.std,'Công hưởng lương / công chuẩn')+t(r.p,'Nghỉ phép trong tháng')+t(r.o,'Nghỉ ốm')+t(r.k,'Nghỉ không lương')+t(r.t,'Công tác ngoài nhà máy (ngày)')+t(r.ot+' giờ','Tăng ca tháng'+(r.ot?' · quy đổi '+r.otEq+' giờ':''))+t(l.left+' / '+l.quota,'Phép năm '+y+' còn lại')+'</div>'+(r.ot>40||H.otYear(st,y)>200?'<div class="alert warn" style="margin-top:10px"><div class="t"><b>Tăng ca vượt giới hạn</b><span class="small">Tháng này '+r.ot+' giờ (tối đa 40), cả năm '+H.otYear(st,y)+' giờ (tối đa 200) theo quy định hiện hành. Hãy kiểm tra lại.</span></div></div>':'')}
function monthHols(){const p=S.month.y+'-'+H.pad(S.month.m)+'-',l=Object.keys(S.holidays).filter(k=>k.indexOf(p)===0).sort();
  return l.length?'<p class="small muted" style="margin-top:8px">Công lễ trong tháng: '+l.map(k=>esc(k.slice(8)+'/'+k.slice(5,7)+' '+S.holidays[k].name)).join(' · ')+'</p>':''}
function pAtt(){
  const list=activeStaff();if(!list.length)return empty('Chưa có nhân viên để chấm công','Thêm nhân viên ở Hồ sơ nhân viên trước.');
  const mode=S.attMode,st=list.find(s=>s._id===S.attEmp)||list[0];S.attEmp=st._id;
  let h=tools(monthNav()+sp+'<div class="brush" role="group"><button class="btn sm'+(mode==='matrix'?' primary':'')+'" data-act="attmode" data-k="matrix">Bảng tổng hợp</button><button class="btn sm'+(mode==='cal'?' primary':'')+'" data-act="attmode" data-k="cal">Lịch từng người</button></div>'+btn('xRep','Xuất bảng chấm công',null,' data-id="att"'))+
   '<div class="card" style="border-radius:0;margin:0;border-top:0"><div class="sec-h"><h3>Chọn loại công rồi chạm vào ô ngày</h3>'+(mode==='cal'?'':'')+btn('fill','Điền X các ngày làm việc đến hôm nay','sm')+'</div>'+brushBar()+'</div>';
  if(mode==='cal'){
    h+='<div style="margin-top:14px">'+card('<div class="field" style="max-width:360px;margin-bottom:12px"><label for="attEmp">Nhân viên</label><select id="attEmp">'+list.map(s=>'<option value="'+esc(s._id)+'"'+(s._id===st._id?' selected':'')+'>'+esc(s.code+' · '+s.name)+'</option>').join('')+'</select></div>'+sumTiles(st)+calHtml(st,true)+monthHols())+'</div>';return h}
  const y=S.month.y,m=S.month.m,n=H.dim(y,m);
  let th='<tr><th class="stick">Nhân viên</th>';for(let d=1;d<=n;d++){const i=H.dayInfo(y,m,d);th+='<th class="dh"'+(i.hol?' title="'+esc(i.hol.name)+'"':'')+'>'+d+'<br>'+H.WD[(i.w+6)%7]+'</th>'}
  th+='<th class="c">Công</th><th class="c">P</th><th class="c">O</th><th class="c">K</th><th class="c">Ngoài</th><th class="c">TC (giờ)</th><th class="c">Chuẩn</th></tr>';
  const body=list.map(s=>{const t=H.summarize(s,y,m);let r='<tr><td class="stick" style="white-space:nowrap"><b>'+esc(s.code)+'</b> '+esc(s.name)+'</td>';
    for(let d=1;d<=n;d++){const i=H.dayInfo(y,m,d),c=H.effCode(s,i);r+='<td class="mc'+(c?' c'+c:'')+(i.off?' off':'')+(i.hol?' hol':'')+'" data-act="mcell" data-e="'+esc(s._id)+'" data-d="'+i.s+'"'+(s.out&&s.out[i.s]&&s.out[i.s].place?' title="Công tác: '+esc(s.out[i.s].place)+'"':'')+'>'+(H.SHOW[c]||'')+(s.ot&&s.ot[i.s]&&s.ot[i.s].h?'<sup class="ot">'+esc(s.ot[i.s].h)+'</sup>':'')+'</td>'}
    return r+'<td class="c num"><b>'+t.paid+'</b></td><td class="c num">'+t.p+'</td><td class="c num">'+t.o+'</td><td class="c num">'+t.k+'</td><td class="c num">'+t.t+'</td><td class="c num"'+(t.ot>40?' style="color:#c0392b;font-weight:700"':'')+'>'+t.ot+'</td><td class="c num muted">'+t.std+'</td></tr>'}).join('');
  return h+'<div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead>'+th+'</thead><tbody>'+body+'</tbody></table></div>'+legend()+monthHols()}
function pLeave(){
  const rows=activeStaff();
  const cols=[{h:'Mã NV',f:s=>'<b>'+esc(s.code)+'</b>'},{h:'Họ và tên',f:s=>esc(s.name)},{h:'Ngày vào làm',f:s=>fmt(s.startDate)},{h:'Nhóm công việc',cls:'wrapc',f:s=>esc((H.CLASS[s.jobClass]||H.CLASS.normal)[0])},
   {h:'Định mức gốc',cls:'r',f:s=>H.leaveInfo(s,S.year).base},{h:'Cộng thâm niên',cls:'r',f:s=>H.leaveInfo(s,S.year).bonus},{h:'Tổng định mức',cls:'r',f:s=>'<b>'+H.leaveInfo(s,S.year).quota+'</b>'},
   {h:'Đã nghỉ phép (ngày)',cls:'r',f:s=>H.leaveInfo(s,S.year).used},{h:'Số đợt nghỉ',cls:'r',f:s=>H.leaveInfo(s,S.year).runs},{h:'Nghỉ ốm',cls:'r',f:s=>H.leaveInfo(s,S.year).sick},{h:'Không lương',cls:'r',f:s=>H.leaveInfo(s,S.year).unpaid},
   {h:'Còn lại',cls:'r',f:s=>{const l=H.leaveInfo(s,S.year);return pill(l.left<0?'bad':l.left<=2?'warn':'ok',l.left+' ngày')}}];
  return tools(yearNav()+sp+btn('xRep','Xuất báo cáo nghỉ phép',null,' data-id="leave"'))+tbl(cols,rows,s=>'data-act="editStaff" data-id="'+esc(s._id)+'"','Chưa có nhân viên.')+
   '<p class="hint" style="margin-top:12px">Định mức theo Bộ luật Lao động 2019: 12 ngày điều kiện bình thường, 14 ngày chưa thành niên, người khuyết tật hoặc làm nghề nặng nhọc, 16 ngày đặc biệt nặng nhọc, cộng 1 ngày cho mỗi 5 năm làm việc. Người vào làm giữa năm được tính theo số tháng làm việc, làm tròn đến 0,5 ngày. Có thể chỉnh thêm hoặc bớt ngày trong hồ sơ từng người.</p>'}
function pContract(){
  const f=fv('cf','60'),rows=activeStaff().map(s=>({s:s,c:H.contractState(s)})).filter(x=>f==='all'||(f==='bad'?x.c.k==='bad':x.c.d<=Number(f))).sort((a,b)=>a.c.d-b.c.d);
  const cols=[{h:'Mã NV',f:x=>'<b>'+esc(x.s.code)+'</b>'},{h:'Họ và tên',f:x=>esc(x.s.name)},{h:'Loại hợp đồng',f:x=>esc(x.s.contractType||'')},{h:'Số hợp đồng',f:x=>esc(x.s.contractNo||'')},{h:'Từ ngày',f:x=>fmt(x.s.contractStart)},{h:'Đến ngày',f:x=>fmt(x.s.contractEnd)},{h:'Tình trạng',f:x=>pill(x.c.k,x.c.t)}];
  return tools(sel('cf','Hiển thị',[['60','Hết hạn trong 60 ngày'],['30','Hết hạn trong 30 ngày'],['90','Hết hạn trong 90 ngày'],['bad','Chỉ hợp đồng quá hạn'],['all','Tất cả']],'60').replace('class="field"','class="field" style="display:flex;gap:8px;align-items:center"').replace('<label','<label style="margin:0"')+sp+btn('xRep','Xuất hợp đồng đến hạn',null,' data-id="contract"'))+
   tbl(cols,rows,x=>'data-act="editStaff" data-id="'+esc(x.s._id)+'"','Không có hợp đồng nào trong phạm vi này.')}
function pHol(){
  const y=S.year,list=Object.keys(S.holidays).filter(k=>k.indexOf(y+'-')===0).sort();
  let h=tools(yearNav()+sp+btn('seedHol','Thêm 4 ngày lễ cố định năm '+y))+tbl([{h:'Ngày',f:k=>'<span class="num">'+fmt(k)+'</span>'},{h:'Thứ',f:k=>H.WD[(H.dow(y,+k.slice(5,7),+k.slice(8))+6)%7]},{h:'Tên ngày lễ',f:k=>'<b>'+esc(S.holidays[k].name)+'</b>'},{h:'',cls:'r',f:k=>'<button class="btn sm danger'+(S.confirm==='h'+k?' armed':'')+'" data-act="delHol" data-d="'+k+'">'+(S.confirm==='h'+k?'Bấm lần nữa để xóa':'Xóa')+'</button>'}],list,null,'Chưa có công lễ năm '+y+'.');
  h+='<div class="cols" style="margin-top:14px">'+card('<h3 style="margin-bottom:10px">Thêm ngày công lễ</h3><div class="grid2">'+fld('hDate','Ngày','date',y+'-01-01')+fld('hName','Tên ngày lễ','text','','maxlength="80" placeholder="Ví dụ: Tết Nguyên đán"')+'</div><div style="margin-top:10px">'+btn('addHol','Thêm','primary')+'</div><p class="hint" style="margin-top:10px">Ngày cố định gồm 1/1, 30/4, 1/5 và 2/9. Tết Nguyên đán, Giỗ Tổ Hùng Vương và ngày nghỉ bù thay đổi theo từng năm, hãy nhập theo thông báo chính thức rồi mới dùng để tính công.</p>')+
   card('<h3 style="margin-bottom:10px">Quy ước tuần làm việc</h3><div class="field" style="max-width:300px"><label for="sat">Thứ Bảy</label><select id="sat"><option value="off"'+(S.settings.sat==='off'?' selected':'')+'>Nghỉ</option><option value="half"'+(S.settings.sat==='half'?' selected':'')+'>Làm nửa ngày</option><option value="full"'+(S.settings.sat==='full'?' selected':'')+'>Làm cả ngày</option></select></div><p class="small muted" style="margin-top:8px">Chủ nhật luôn là ngày nghỉ. Quy ước này quyết định số công chuẩn của mỗi tháng.</p>')+'</div>';
  return h}
function pAcc(){
  let h=card('<div class="sec-h"><h3>Yêu cầu liên kết tài khoản</h3></div>'+(S.claims.length?S.claims.map(c=>{const code=String(c.code||'').toUpperCase(),st=S.staff.find(s=>s.code===code&&!s.uid);
    return '<div class="alert '+(st?'note':'warn')+'"><div class="t"><b>'+esc(H.nameOf(c._id))+' nhập mã '+esc(code)+'</b><span class="small">'+(st?'Khớp hồ sơ: '+esc(st.name)+' · '+esc(st.dept||'chưa có phòng ban'):'Không có hồ sơ chưa liên kết với mã này')+'</span></div><span class="tools" style="border:0;padding:0;background:none">'+(st?btn('approve','Duyệt','sm primary',' data-id="'+esc(c._id)+'"'):'')+btn('reject','Từ chối','sm',' data-id="'+esc(c._id)+'"')+'</span></div>'}).join(''):'<p class="muted">Chưa có yêu cầu. Khi nhân viên mở trang bằng tài khoản được mời và nhập mã nhân viên, yêu cầu hiện ở đây.</p>'));
  const linked=S.staff.filter(s=>s.uid).length,unl=S.staff.filter(s=>!s.uid&&s.status!=='left');
  h+=card('<h3 style="margin-bottom:8px">Trạng thái liên kết</h3><div class="line"><span>Đã liên kết tài khoản</span><span><b>'+linked+'</b></span></div><div class="line"><span>Chưa liên kết</span><span><b>'+unl.length+'</b>'+(unl.length?' · '+esc(unl.slice(0,8).map(s=>s.code).join(', '))+(unl.length>8?'…':''):'')+'</span></div>');
  return h+card('<h3 style="margin-bottom:8px">Cách cấp tài khoản cho nhân viên</h3><ol class="steps"><li>Tạo hồ sơ nhân viên với mã nhân viên, hoặc nhập hàng loạt từ Excel hay Google Sheets.</li><li>Dùng nút Chia sẻ của Claude để mời email của nhân viên, chọn quyền Người đóng góp.</li><li>Nhân viên mở liên kết trên điện thoại và nhập mã nhân viên của mình.</li><li>Bạn kiểm tra tên rồi bấm Duyệt. Từ đó nhân viên chỉ xem được hồ sơ, ngày công và phiếu cấp phát của chính mình, và ký nhận ngay trên điện thoại.</li></ol>')}

/* ===== tài sản ===== */
function pAssets(){
  const q=fv('q').toLowerCase(),f=fv('af','all');
  const rows=S.assets.slice().sort(H.byCode).map(a=>({a:a,st:H.assetState(a)})).filter(x=>(f==='all'||x.st.k===f)&&(!q||(x.a.code+' '+x.a.name+' '+(x.a.holder||'')+' '+(x.a.serial||'')).toLowerCase().indexOf(q)>=0));
  const cols=[{h:'Mã',f:x=>'<b>'+esc(x.a.code)+'</b>'},{h:'Tên tài sản',cls:'wrapc',f:x=>esc(x.a.name)},{h:'Loại',f:x=>esc(x.a.cat||'')},{h:'Người giữ',f:x=>esc(x.a.holder||'')},{h:'Vị trí chuẩn',f:x=>esc(x.a.expectedLoc?H.locName(x.a.expectedLoc):'—')},
   {h:'Quét gần nhất',f:x=>{const s=S.scans[x.a._id];return s?esc(H.locName(s.loc))+'<br><span class="small muted">'+H.fmtTs(s.at)+'</span>':'—'}},{h:'Nguyên giá',cls:'r',f:x=>'<span class="num">'+H.money(x.a.value)+'</span>'},{h:'Tình trạng vị trí',f:x=>pill(x.st.k,x.st.t)}];
  return tools(btn('newAsset','+ Thêm tài sản','primary')+btn('goImport','Nhập từ Excel / Google Sheets',null,' data-e="assets"')+btn('xEnt','Xuất Excel',null,' data-e="assets"')+btn('xRep','Báo cáo kiểm kê',null,' data-id="assets"')+sp+
   '<select id="f_af" data-f="af" aria-label="Lọc">'+[['all','Tất cả'],['ok','Đúng chỗ'],['bad','Sai chỗ'],['warn','Chưa quét'],['none','Chưa gán vị trí']].map(o=>'<option value="'+o[0]+'"'+(f===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+search('Tìm mã, tên, người giữ'))+
   tbl(cols,rows,x=>'data-act="editAsset" data-id="'+esc(x.a._id)+'"',S.assets.length?'Không có kết quả khớp.':'Chưa có tài sản. Thêm từng tài sản hoặc nhập từ Excel, rồi in nhãn QR dán lên thiết bị.')}
function pLocs(){
  const rows=S.locs.slice().sort(H.byCode);
  const cols=[{h:'Mã vị trí',f:l=>'<b>'+esc(l.code)+'</b>'},{h:'Tên vị trí',f:l=>esc(l.name)},{h:'Ghi chú',f:l=>esc(l.note||'')},{h:'Tài sản thuộc vị trí',cls:'r',f:l=>S.assets.filter(a=>a.expectedLoc===l._id).length},{h:'Nhãn QR',f:l=>btn('qr','Xem mã QR','sm',' data-t="VT:'+esc(l.code)+'" data-c="'+esc(l.code)+'" data-n="'+esc(l.name)+'"')}];
  return tools(btn('newLoc','+ Thêm vị trí','primary')+btn('goImport','Nhập từ Excel / Google Sheets',null,' data-e="locs"')+sp+btn('lblAssets','Tải ảnh nhãn QR tài sản')+btn('lblLocs','Tải ảnh nhãn QR vị trí'))+
   tbl(cols,rows,l=>'data-act="editLoc" data-id="'+esc(l._id)+'"','Chưa có vị trí nào. Thêm các phòng, kệ, kho để gán vị trí chuẩn cho tài sản.')+
   '<p class="hint" style="margin-top:12px">Ảnh nhãn gồm nhiều mã QR xếp thành lưới, tải về rồi in và dán lên tài sản hoặc cửa phòng. Mã QR tài sản có dạng TS:mã, mã QR vị trí có dạng VT:mã.</p>'}
function pScan(){
  const sc=S.scan,locs=S.locs.slice().sort(H.byCode),r=sc.res;
  let h=card('<h3 style="margin-bottom:8px">1. Bạn đang đứng ở đâu</h3><div class="grid2"><div class="field"><label for="scanLoc">Vị trí hiện tại</label><select id="scanLoc"><option value="">— Chọn vị trí —</option>'+locs.map(l=>'<option value="'+esc(l._id)+'"'+(sc.loc===l._id?' selected':'')+'>'+esc(l.name+' ('+l.code+')')+'</option>').join('')+'</select></div><div class="field"><label>Hoặc quét mã QR vị trí</label><label class="btn" for="scanLocFile">Chụp mã QR vị trí</label><input id="scanLocFile" type="file" accept="image/*" capture="environment" hidden></div></div>')+
   card('<h3 style="margin-bottom:8px">2. Quét tài sản</h3><div class="grid2"><div class="field"><label>Chụp mã QR trên tài sản</label><label class="btn primary" for="scanAssetFile">Chụp mã QR tài sản</label><input id="scanAssetFile" type="file" accept="image/*" capture="environment" hidden></div>'+fld('scanCode','Hoặc nhập mã tài sản','text','','maxlength="30" autocapitalize="characters" placeholder="Ví dụ: TS001"')+'</div><div style="margin-top:10px">'+btn('scanManual','Kiểm tra mã vừa nhập')+'</div><p class="small muted" style="margin-top:8px">Trang này không mở được camera trực tiếp. Bấm nút để chụp ảnh mã QR, hệ thống đọc mã từ ảnh.</p>'+
   (r?'<div class="scanres '+r.k+'"><b>'+esc(r.title)+'</b><p>'+r.html+'</p></div>':''));
  if(sc.hist.length)h+=card('<h3 style="margin-bottom:8px">Đã quét trong phiên này</h3>'+sc.hist.map(x=>'<div class="line"><span>'+esc(x.code+' · '+x.name)+'</span><span>'+pill(x.k,x.t)+'</span></div>').join(''));
  return h}

/* ===== kho ===== */
function pItems(){
  const q=fv('q').toLowerCase(),sm=H.stockMap();
  const rows=S.items.slice().sort(H.byCode).filter(i=>!q||(i.code+' '+i.name+' '+(i.cat||'')).toLowerCase().indexOf(q)>=0);
  const cols=[{h:'Mã',f:i=>'<b>'+esc(i.code)+'</b>'},{h:'Tên vật tư',cls:'wrapc',f:i=>esc(i.name)},{h:'Nhóm',f:i=>esc(i.cat||'')},{h:'Kho',f:i=>esc(i.kho||'')},{h:'ĐVT',f:i=>esc(i.unit||'')},{h:'Tồn kho',cls:'r',f:i=>'<b class="num">'+(sm[i.code]||0)+'</b>'},{h:'Tối thiểu',cls:'r',f:i=>esc(i.min===''||i.min==null?'—':i.min)},
   {h:'Mức tồn',f:i=>{const s=sm[i.code]||0;return i.min!==''&&i.min!=null&&s<=Number(i.min)?pill(s<=0?'bad':'warn',s<=0?'Hết hàng':'Sắp hết'):pill('ok','Đủ')}}];
  return tools(btn('newItem','+ Thêm vật tư','primary')+btn('goImport','Nhập từ Excel / Google Sheets',null,' data-e="items"')+btn('xEnt','Xuất danh mục',null,' data-e="items"')+btn('xRep','Báo cáo nhập xuất tồn',null,' data-id="nxt"')+sp+search('Tìm mã, tên, nhóm'))+
   tbl(cols,rows,i=>'data-act="editItem" data-id="'+esc(i._id)+'"',S.items.length?'Không có kết quả khớp.':'Chưa có vật tư. Thêm văn phòng phẩm, túi, giấy, bảo hộ lao động, vật dụng sản xuất.')}
const photoBox=(key,label,multi)=>{const v=S.form[key],list=multi?(v||[]):(v?[v]:[]);
  return '<div class="field"><label>'+label+'</label><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label class="btn'+(list.length?'':' primary')+'" for="ev_'+key+'">'+(list.length?(multi?'Thêm ảnh':'Chụp lại'):'Chụp ảnh')+'</label><input id="ev_'+key+'" data-ev="'+key+'"'+(multi?' data-multi="1"':'')+' type="file" accept="image/*" capture="environment" hidden>'+
   list.map((p,i)=>'<img alt="Ảnh '+(i+1)+'" src="'+esc(p)+'" style="height:56px;border-radius:6px;border:1px solid var(--line)">').join('')+(list.length?'<button class="btn sm" data-act="evClear" data-k="'+key+'">Xóa ảnh</button>':'')+'</div></div>'};
H.photoBox=photoBox;
function pStock(){
  const items=S.items.slice().sort(H.byCode);
  if(!items.length)return empty('Chưa có vật tư','Tạo danh mục vật tư trước khi nhập, xuất kho.',btn('nav','Mở danh mục vật tư','primary',' data-p="items"'));
  const run={},after={};
  S.tx.filter(t=>!t.void).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||(a.at||0)-(b.at||0)).forEach(t=>{const q=Number(t.qty)||0;run[t.item]=(run[t.item]||0)+(t.type==='out'?-q:q);after[t._id]=run[t.item]});
  const rows=S.tx.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||(b.at||0)-(a.at||0)).slice(0,300);
  const ty=fv('tType','in');
  let h=card('<h3 style="margin-bottom:10px">Ghi phiếu kho</h3><div class="grid2">'+sel('tType','Loại phiếu',[['in','Nhập kho'],['out','Xuất kho khác'],['adj','Điều chỉnh (+/-), cần lý do']],'in')+
   sel('tItem','Vật tư',items.map(i=>[i._id,i.code+' · '+i.name+' ('+i.kho+')']),items[0]._id)+fld('tQty','Số lượng','number','','step="any" placeholder="0"')+fld('tDate','Ngày','date',H.todayStr())+
   fld('tCp',ty==='in'?'Người giao hàng (nhà cung cấp, bộ phận) *':ty==='out'?'Người nhận hàng *':'Người xác nhận điều chỉnh *','text','','maxlength="80"')+fld('tNote',ty==='adj'?'Lý do điều chỉnh *':'Ghi chú, số chứng từ','text','','maxlength="100"')+
   photoBox('tPhoto','Ảnh hàng thực tế *')+'</div><div style="margin-top:10px">'+btn('addTx','Ký xác nhận và ghi phiếu','primary')+'</div><p class="small muted" style="margin-top:8px">Mỗi phiếu bắt buộc có ảnh chụp hàng thực tế và chữ ký của người giao hoặc nhận, được lưu kèm để đối chiếu. Tồn kho tính từ các phiếu, không nhập tay. Phiếu sai không xóa được, chỉ hủy kèm lý do và vẫn lưu vết. Kiểm đếm thực tế ở mục Kiểm kê kho.</p>');
  const cols=[{h:'Ngày',f:t=>fmt(t.date)},{h:'Loại',f:t=>t.void?pill('none','Đã hủy'):pill(t.type==='in'?'ok':t.type==='out'?'warn':'note',t.type==='in'?'Nhập':t.type==='out'?'Xuất':'Điều chỉnh')},
   {h:'Vật tư',cls:'wrapc',f:t=>'<span'+(t.void?' style="text-decoration:line-through"':'')+'>'+esc(t.item+' · '+(t.itemName||''))+'</span>'},{h:'Kho',f:t=>esc(t.kho||'')},
   {h:'Số lượng',cls:'r',f:t=>'<b class="num">'+esc(t.qty)+'</b>'},{h:'Tồn sau phiếu',cls:'r',f:t=>t.void?'—':'<span class="num">'+(after[t._id]==null?'':Math.round(after[t._id]*1000)/1000)+'</span>'},
   {h:'Người giao / nhận',cls:'wrapc',f:t=>esc(t.cp||'')+(t.by?'<br><span class="small muted">Lập: '+esc(t.by)+'</span>':'')},
   {h:'Ghi chú',cls:'wrapc',f:t=>esc(t.note||'')+(t.ref&&t.ref!=='KK'?' <span class="muted small">(cấp phát)</span>':'')+(t.evId?' <span class="muted small">(kiểm kê)</span>':'')+(t.void?'<br><span class="small muted">Hủy: '+esc(t.voidReason||'')+' · '+esc(t.voidBy||'')+'</span>':'')},
   {h:'',cls:'r',f:t=>(t.ev?btn('viewEv','Ảnh và chữ ký','sm',' data-id="'+esc(t._id)+'"'):'<span class="small muted">Chưa có chứng từ</span>')+(t.void||t.ref||t.evId?'':' '+btn('voidTx','Hủy','sm danger',' data-id="'+esc(t._id)+'"'))}];
  return h+tbl(cols,rows,null,'Chưa có phiếu nào.')}
function pIssue(){
  const emps=activeStaff(),items=S.items.slice().sort(H.byCode);
  if(!emps.length||!items.length)return empty('Chưa đủ dữ liệu để cấp phát','Cần có nhân viên và vật tư trong danh mục.',btn('nav','Mở danh mục vật tư','primary',' data-p="items"'));
  const sm=H.stockMap();
  let h=card('<h3 style="margin-bottom:10px">Phiếu cấp phát</h3><div class="grid2">'+sel('iEmp','Người nhận',emps.map(s=>[s._id,s.code+' · '+s.name+(s.uid?'':' (chưa có TK)')]),emps[0]._id)+
   sel('iItem','Vật tư',items.map(i=>[i._id,i.code+' · '+i.name+' (tồn '+(sm[i.code]||0)+' '+(i.unit||'')+')']),items[0]._id)+fld('iQty','Số lượng','number','','step="any" min="0" placeholder="0"')+fld('iDate','Ngày cấp','date',H.todayStr())+
   sel('iMode','Cách ký nhận',[['app','Nhân viên ký trên tài khoản của họ'],['now','Nhân viên ký ngay trên thiết bị này']],'app')+fld('iNote','Ghi chú','text','','maxlength="100"')+photoBox('iPhoto','Ảnh hàng thực tế đang giao *')+'</div><div style="margin-top:10px">'+btn('addIssue','Lập phiếu cấp phát','primary')+btn('xRep','Xuất sổ cấp phát',null,' data-id="issue"')+'</div>');
  const rows=S.issues.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||(b.createdAt||0)-(a.createdAt||0)).slice(0,300);
  const cols=[{h:'Ngày',f:i=>fmt(i.date)},{h:'Người nhận',cls:'wrapc',f:i=>'<b>'+esc(i.empCode)+'</b> '+esc(i.empName)},{h:'Vật tư',cls:'wrapc',f:i=>esc(i.itemName)},{h:'Số lượng',cls:'r',f:i=>'<b class="num">'+esc(i.qty)+'</b> '+esc(i.unit||'')},
   {h:'Ký nhận',f:i=>H.issSigned(i)?pill('ok','Đã ký'):pill('warn','Chờ ký')},{h:'',cls:'r',f:i=>btn('viewEv','Ảnh hàng','sm',' data-id="tx'+esc(i._id)+'"')+' '+(H.issSigned(i)?btn('viewSig','Xem chữ ký','sm',' data-id="'+esc(i._id)+'"'):'')+' <button class="btn sm danger'+(S.confirm==='i'+i._id?' armed':'')+'" data-act="delIssue" data-id="'+esc(i._id)+'">'+(S.confirm==='i'+i._id?'Bấm lần nữa':'Xóa')+'</button>'}];
  return h+tbl(cols,rows,null,'Chưa có phiếu cấp phát nào.')}

/* ===== báo cáo, nhập dữ liệu ===== */
function pReports(){
  const hasG=!!S.mcp;
  let h=card('<h3 style="margin-bottom:10px">Thông tin đơn vị và Google Sheets</h3><div class="grid2">'+fld('company','Tên đơn vị (in trên báo cáo)','text',S.settings.company,'maxlength="120"')+fld('address','Địa chỉ','text',S.settings.address,'maxlength="160"')+fld('sheetId','Liên kết hoặc mã Google Sheets','text',S.settings.sheetId,'placeholder="https://docs.google.com/spreadsheets/d/..."')+'</div><div class="tools" style="border:0;padding:10px 0 0;background:none">'+btn('saveInfo','Lưu thông tin','primary')+btn('gsCheck','Kiểm tra kết nối Google Sheets')+'</div>'+(S.form.gsMsg?'<p class="small" style="margin-top:8px">'+esc(S.form.gsMsg)+'</p>':'')+'<p class="small muted" style="margin-top:8px">Tạo sẵn các trang tính (tab) đúng tên trong tệp Google Sheets: '+S.REPTABS+'. Báo cáo ghi đè nội dung tab tương ứng.</p>');
  h+=card('<h3 style="margin-bottom:8px">Logo ORISTAR</h3><p class="muted small" style="margin-bottom:10px">Mặc định là logo vẽ sẵn dạng huy hiệu 3D. Tải ảnh logo thật của công ty (PNG nền trong suốt hoặc ảnh vuông) để thay thế, ảnh sẽ xoay 3D trên menu.</p><div class="tools" style="border:0;padding:0;background:none"><label class="btn primary" for="logoFile">Tải logo lên</label><input id="logoFile" type="file" accept="image/*" hidden>'+(S.settings.logo?btn('rmLogo','Dùng logo mặc định'):'')+'</div>');
  h+=card('<div class="tools" style="border:0;padding:0;background:none">'+monthNav()+yearNav()+'</div>');
  h+='<div class="cols">'+H.REP.map(r=>card('<h3>'+esc(r.label)+'</h3><p class="muted small" style="margin:4px 0 10px">'+esc(r.desc)+'</p><div class="tools" style="border:0;padding:0;background:none">'+btn('xRep','Tải Excel','sm primary',' data-id="'+r.id+'"')+(hasG?btn('gRep','Ghi lên Google Sheets','sm',' data-id="'+r.id+'"'):'')+'</div>')).join('')+'</div>';
  return h+'<p class="hint">Báo cáo tải về dưới dạng Excel có tiêu đề đơn vị, kỳ báo cáo và khối chữ ký. Trang này không tự chạy theo lịch, hãy bấm ghi lên Google Sheets mỗi khi cần cập nhật. Hãy đối chiếu bố cục với mẫu của kế toán trưởng trước khi nộp.</p>'}
function pImport(){
  const ek=fv('ie','staff'),E=H.ENT[ek],imp=S.imp;
  let h=card('<h3 style="margin-bottom:10px">Nguồn dữ liệu</h3><div class="grid2">'+sel('ie','Loại dữ liệu',Object.keys(H.ENT).map(k=>[k,H.ENT[k].label]),'staff')+
   '<div class="field"><label>Tệp Excel hoặc CSV</label><input id="impFile" type="file" accept=".xlsx,.xls,.csv,.txt,.tsv"></div></div>'+
   '<div class="field" style="margin-top:10px"><label for="f_paste">Hoặc dán dữ liệu thô (copy từ Excel, Google Sheets; hàng đầu là tiêu đề cột)</label><textarea id="f_paste" data-f="paste" placeholder="Mã nhân viên&#9;Họ và tên&#9;Phòng ban&#10;NV001&#9;Nguyễn Văn A&#9;Sản xuất">'+esc(fv('paste'))+'</textarea></div>'+
   '<div class="tools" style="border:0;padding:10px 0 0;background:none">'+btn('impPaste','Đọc dữ liệu đã dán','primary')+(S.mcp?btn('impSheet','Đọc từ Google Sheets (tab '+E.tab+')'):'')+btn('tplEnt','Tải file mẫu',null,' data-e="'+ek+'"')+'</div><p class="small muted" style="margin-top:8px">Cột nhận diện theo tên tiêu đề: '+E.cols.map(c=>esc(c[1])).join(', ')+'. Mã đã có sẽ được cập nhật, mã mới sẽ được thêm.</p>');
  if(S.busy==='import'&&imp&&imp.progress!=null)h+=card('<p><b>Đang ghi dữ liệu</b> '+imp.progress+' / '+imp.recs.length+'</p>');
  if(imp&&imp.ek===ek){
    h+=card('<div class="sec-h"><h3>Xem trước: '+imp.recs.length+' dòng hợp lệ</h3>'+(imp.recs.length?btn('impGo','Nhập '+imp.recs.length+' dòng vào hệ thống','primary'):'')+'</div>'+
     (imp.mapped.length?'<p class="small"><b>Cột đã nhận:</b> '+imp.mapped.map(esc).join(', ')+'</p>':'')+(imp.unmapped.length?'<p class="small muted"><b>Cột bỏ qua:</b> '+imp.unmapped.map(esc).join(', ')+'</p>':'')+
     (imp.errors.length?'<div class="alert bad" style="display:block;margin-top:8px">'+imp.errors.slice(0,6).map(esc).join('<br>')+(imp.errors.length>6?'<br>và '+(imp.errors.length-6)+' lỗi khác':'')+'</div>':'')+
     (imp.recs.length?'<div class="tbl-wrap" style="margin-top:8px;max-height:300px"><table class="tbl"><thead><tr>'+E.cols.filter(c=>imp.recs.some(r=>r[c[0]]!=null)).map(c=>'<th>'+esc(c[1])+'</th>').join('')+'</tr></thead><tbody>'+imp.recs.slice(0,8).map(r=>'<tr>'+E.cols.filter(c=>imp.recs.some(x=>x[c[0]]!=null)).map(c=>'<td>'+esc(r[c[0]]!=null?(c[3]==='date'?fmt(r[c[0]]):r[c[0]]):'')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':''))}
  return h}

/* ===== nhân viên tự xem ===== */
function claimHtml(){return empty('Chưa có hồ sơ nhân sự','Tài khoản của bạn đã đăng nhập nhưng chưa được gắn với hồ sơ nhân viên. Liên hệ bộ phận nhân sự để được cập nhật.')}
function pMe(){
  if(!S.uid)return empty('Cần đăng nhập','Đăng nhập bằng email cá nhân đã được quản trị viên đăng ký.');
  const st=S.myDoc;if(!st)return claimHtml();
  const c=st.status==='left'?{k:'none',t:'Đã nghỉ việc'}:H.contractState(st),l=H.leaveInfo(st,S.year);let h='';
  if(c.k==='bad'||c.k==='warn'||c.k==='note')h+='<div class="alert '+c.k+'"><div class="t"><b>Hợp đồng lao động '+(c.k==='bad'?'đã đến hạn':'sắp hết hạn')+'</b><span class="small">Hết hạn '+fmt(st.contractEnd)+'. Liên hệ bộ phận nhân sự để gia hạn hoặc ký mới.</span></div>'+pill(c.k,c.t)+'</div>';
  const ups=H.upcomingHolidays(1)[0];if(ups&&ups.days<=30)h+='<div class="alert note"><div class="t"><b>Sắp đến công lễ: '+esc(ups.name)+'</b><span class="small">'+fmt(ups.date)+(ups.days===0?' (hôm nay)':' · còn '+ups.days+' ngày')+'</span></div></div>';
  const pend=S.myIssues.filter(i=>!S.mySigns[i._id]&&i.status!=='signed').length;
  if(pend)h+='<div class="alert warn"><div class="t"><b>Có '+pend+' phiếu cấp phát chờ bạn ký nhận</b></div>'+btn('nav','Mở phiếu','sm primary',' data-p="myissue"')+'</div>';
  h+='<div class="cols">'+card('<div style="display:flex;gap:14px;align-items:center;margin-bottom:10px">'+avatar(st,true)+'<div style="min-width:0"><h2>'+esc(st.name)+'</h2><span class="muted">Mã '+esc(st.code)+(st.dept?' · '+esc(st.dept):'')+(st.title?' · '+esc(st.title):'')+'</span></div></div>'+
   '<div class="line"><span>Quê quán</span><span>'+esc(st.hometown||'—')+'</span></div><div class="line"><span>Email cá nhân</span><span>'+esc(st.email||'—')+'</span></div><div class="line"><span>Số điện thoại</span><span>'+esc(st.phone||'—')+'</span></div><div class="line"><span>Ngày vào làm</span><span>'+fmt(st.startDate)+'</span></div>')+
   card('<h3 style="margin-bottom:8px">Hợp đồng lao động</h3><div class="line"><span>Loại hợp đồng</span><span>'+esc(st.contractType||'—')+'</span></div>'+(st.contractNo?'<div class="line"><span>Số hợp đồng</span><span>'+esc(st.contractNo)+'</span></div>':'')+'<div class="line"><span>Hiệu lực từ</span><span>'+fmt(st.contractStart)+'</span></div><div class="line"><span>Hết hạn</span><span>'+(/không xác định/i.test(st.contractType||'')?'Không thời hạn':fmt(st.contractEnd))+'</span></div><div class="line"><span>Còn lại</span><span>'+pill(c.k,c.t)+'</span></div>')+
   card('<h3 style="margin-bottom:8px">Nghỉ phép năm '+S.year+'</h3><div class="line"><span>Định mức theo luật</span><span><b>'+l.quota+'</b> ngày ('+l.base+' gốc'+(l.bonus?' + '+l.bonus+' thâm niên':'')+(l.extra?(l.extra>0?' + ':' ')+l.extra+' điều chỉnh':'')+')</span></div><div class="line"><span>Đã nghỉ phép</span><span><b>'+l.used+'</b> ngày, '+l.runs+' đợt</span></div><div class="line"><span>Nghỉ ốm</span><span>'+l.sick+' ngày</span></div><div class="line"><span>Nghỉ không lương</span><span>'+l.unpaid+' ngày</span></div><div class="line"><span>Phép còn lại</span><span>'+pill(l.left<0?'bad':l.left<=2?'warn':'ok',l.left+' ngày')+'</span></div>')+'</div>';
  return h}
function pMyAtt(){
  const st=S.myDoc;if(!st)return pMe();
  return card('<div class="sec-h"><h3>Ngày công của bạn</h3>'+monthNav()+'</div>'+sumTiles(st)+calHtml(st,false)+monthHols())}
function pMyIssue(){
  if(!S.myDoc)return pMe();
  const rows=S.myIssues.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if(!rows.length)return empty('Chưa có phiếu cấp phát','Khi bộ phận HCNS cấp vật tư hoặc bảo hộ lao động cho bạn, phiếu sẽ hiện ở đây để ký nhận.');
  return rows.map(i=>{const signed=!!S.mySigns[i._id]||i.status==='signed';
    return card('<div class="sec-h"><h3>'+esc(i.itemName)+'</h3>'+(signed?pill('ok','Đã ký nhận'):pill('warn','Chờ ký'))+'</div><div class="line"><span>Số lượng</span><span><b>'+esc(i.qty)+'</b> '+esc(i.unit||'')+'</span></div><div class="line"><span>Ngày cấp</span><span>'+fmt(i.date)+'</span></div>'+(i.note?'<div class="line"><span>Ghi chú</span><span>'+esc(i.note)+'</span></div>':'')+(signed?'':'<div style="margin-top:10px">'+btn('signIssue','Ký nhận','primary',' data-id="'+esc(i._id)+'"')+'</div>'))}).join('')}
})();
