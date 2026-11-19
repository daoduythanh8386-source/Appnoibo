(function(){
'use strict';
const H=window.__HR,S=H.S,esc=H.esc,fmt=H.fmt,toast=H.toast,save=H.save,$=H.$,render=H.render;
S.REPTABS=['NhanVien','TaiSan','VatTu','ViTri'].concat(H.REP.map(r=>r.tab)).join(', ');
const COL={staff:'staff',assets:'assets',items:'items',locs:'locations'};
const docId=(ek,code)=>ek==='staff'?'nv-'+code.toLowerCase():code;
const listOf=ek=>H.dataOf(ek);
const ASTATE=['Đang dùng','Đang sửa chữa','Hỏng','Đã thanh lý'];

/* ===== hộp thoại ===== */
let M={};
function showModal(inner,opts){$('#modal').innerHTML='<div class="overlay" data-act="closeModal"><div class="sheet'+(opts&&opts.wide?' wide':'')+'">'+inner+'</div></div>';$('#modal').hidden=false;M=opts||{}}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';M={};S.confirm=''}
const mi=(id,l,t,v,x)=>'<div class="field"><label for="m_'+id+'">'+l+'</label><input id="m_'+id+'" type="'+(t||'text')+'" value="'+esc(v==null?'':v)+'" '+(x||'')+'></div>';
const ms=(id,l,opts,v)=>'<div class="field"><label for="m_'+id+'">'+l+'</label><select id="m_'+id+'">'+opts.map(o=>{const a=Array.isArray(o)?o[0]:o,t=Array.isArray(o)?o[1]:o;return '<option value="'+esc(a)+'"'+(String(v)===String(a)?' selected':'')+'>'+esc(t)+'</option>'}).join('')+'</select></div>';
const mv=id=>{const n=$('#m_'+id);return n?n.value.trim():''};
const head=(t)=>'<div class="sec-h"><h2>'+t+'</h2><button type="button" class="btn sm" data-act="closeModal">Đóng</button></div>';

function openEnt(ek,id){
  const ex=id?listOf(ek).find(r=>r._id===id):null,v=ex||{};let h='',wide=false;
  if(ek==='staff'){
    wide=true;const l=ex?H.leaveInfo(ex,S.year):null;
    h=head(ex?'Hồ sơ nhân viên':'Thêm nhân viên')+'<form id="mf">'+
     '<div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><div id="m_av">'+(v.photo?'<img class="avatar lg" alt="" src="'+esc(v.photo)+'">':'<span class="avatar lg">'+esc(H.initials(v.name))+'</span>')+'</div><div><label class="btn" for="m_photo">Chọn ảnh</label><input id="m_photo" type="file" accept="image/*" hidden> <button type="button" class="btn sm" data-act="rmPhoto">Bỏ ảnh</button><p class="small muted" style="margin-top:6px">Ảnh được cắt vuông và thu nhỏ trước khi lưu.</p></div></div>'+
     (l?'<div class="hint" style="margin-bottom:12px">Phép năm '+S.year+': định mức <b>'+l.quota+'</b> ngày, đã nghỉ <b>'+l.used+'</b> ngày ('+l.runs+' đợt), nghỉ ốm '+l.sick+', không lương '+l.unpaid+', còn lại <b>'+l.left+'</b> ngày.'+(H.contractState(ex).d<90000?' Hợp đồng: '+H.contractState(ex).t+'.':'')+'</div>':'')+
     '<div class="grid2">'+mi('code','Mã nhân viên *','text',v.code||nextCode('NV',S.staff),(ex?'readonly ':'')+'maxlength="30" autocapitalize="characters"')+mi('name','Họ và tên *','text',v.name,'maxlength="80"')+mi('dept','Phòng ban / bộ phận','text',v.dept,'maxlength="60"')+mi('title','Chức danh','text',v.title,'maxlength="60"')+
     mi('hometown','Quê quán','text',v.hometown,'maxlength="100"')+mi('email','Email cá nhân','email',v.email,'maxlength="80"')+mi('phone','Số điện thoại','tel',v.phone,'maxlength="20"')+mi('startDate','Ngày vào làm','date',v.startDate)+
     ms('contractType','Loại hợp đồng',H.CONTRACTS,v.contractType||'Xác định thời hạn')+mi('contractNo','Số hợp đồng','text',v.contractNo,'maxlength="40"')+mi('contractStart','Hợp đồng từ ngày','date',v.contractStart)+mi('contractEnd','Hợp đồng đến ngày','date',v.contractEnd)+
     ms('jobClass','Nhóm công việc (để tính phép)',Object.keys(H.CLASS).map(k=>[k,H.CLASS[k][0]+' ('+H.CLASS[k][1]+' ngày)']),v.jobClass||'normal')+mi('leaveExtra','Điều chỉnh phép (+/- ngày)','number',v.leaveExtra==null?0:v.leaveExtra,'step="0.5" min="-30" max="30"')+
     ms('status','Trạng thái',[['active','Đang làm việc'],['left','Đã nghỉ việc']],v.status==='left'?'left':'active')+
     ms('role','Quyền tài khoản',[['employee','Nhân viên (chỉ xem thông tin của mình)'],['manager','Quản lý (xem nhân viên trực tiếp)']],v.role==='manager'?'manager':'employee')+
     ms('managerCode','Quản lý trực tiếp',[['','— Không —']].concat(S.staff.filter(x=>x.role==='manager'&&x.code!==v.code&&x.status!=='left').sort(H.byCode).map(x=>[x.code,x.name+' ('+x.code+')'])),v.managerCode||'')+'</div>'+
     (!ex?'<label class="chk" style="margin-top:10px"><input type="checkbox" id="m_mkacc" checked> Tạo tài khoản đăng nhập bằng email cá nhân ở trên (hệ thống gửi mã OTP về email để đặt mật khẩu)</label>':(ex.uid?'<p class="small muted" style="margin-top:10px">Tài khoản đăng nhập: '+esc(ex.email||'')+'</p>':'<p class="small muted" style="margin-top:10px">Hồ sơ này chưa có tài khoản đăng nhập. Tạo ở mục Tài khoản và phân quyền.</p>'));
  }else if(ek==='assets'){
    h=head(ex?'Tài sản':'Thêm tài sản')+'<form id="mf"><div class="grid2">'+mi('code','Mã tài sản *','text',v.code||nextCode('TS',S.assets),(ex?'readonly ':'')+'maxlength="30" autocapitalize="characters"')+mi('name','Tên tài sản *','text',v.name,'maxlength="100"')+ms('cat','Loại',H.ACAT,v.cat||H.ACAT[0])+mi('serial','Số serial','text',v.serial,'maxlength="60"')+mi('buyDate','Ngày mua','date',v.buyDate)+mi('value','Nguyên giá (đồng)','number',v.value,'min="0" step="1000"')+
     mi('holder','Người đang giữ','text',v.holder,'maxlength="80"')+ms('expectedLoc','Vị trí chuẩn (đúng chỗ)',[['','— Chưa gán —']].concat(S.locs.slice().sort(H.byCode).map(l=>[l._id,l.name+' ('+l.code+')'])),v.expectedLoc||'')+ms('state','Tình trạng',ASTATE,v.state||ASTATE[0])+mi('note','Ghi chú','text',v.note,'maxlength="120"')+'</div>';
  }else if(ek==='items'){
    h=head(ex?'Vật tư':'Thêm vật tư')+'<form id="mf"><div class="grid2">'+mi('code','Mã vật tư *','text',v.code||nextCode('VT',S.items),(ex?'readonly ':'')+'maxlength="30" autocapitalize="characters"')+mi('name','Tên vật tư *','text',v.name,'maxlength="100"')+ms('cat','Nhóm',H.ICAT,v.cat||H.ICAT[0])+mi('unit','Đơn vị tính','text',v.unit,'maxlength="20" placeholder="Cái, đôi, ram, hộp"')+ms('kho','Kho',H.KHO,v.kho||H.KHO[1])+mi('min','Tồn tối thiểu (để cảnh báo)','number',v.min,'min="0" step="any"')+'</div>';
  }else{
    h=head(ex?'Vị trí':'Thêm vị trí')+'<form id="mf"><div class="grid2">'+mi('code','Mã vị trí *','text',v.code||nextCode('VT',S.locs).replace('VT','VT-'),(ex?'readonly ':'')+'maxlength="30" autocapitalize="characters"')+mi('name','Tên vị trí *','text',v.name,'maxlength="80" placeholder="Ví dụ: Phòng kế toán, Kệ A2"')+mi('note','Ghi chú','text',v.note,'maxlength="120"')+'</div>';
  }
  h+='<p class="err" id="mErr"></p><div class="actions"><div class="tools" style="border:0;padding:0;background:none">'+
    (ex&&ek==='staff'?'<button type="button" class="btn" data-act="goAtt" data-id="'+esc(ex._id)+'">Chấm công</button>':'')+
    (ex&&(ek==='assets'||ek==='locs')?'<button type="button" class="btn" data-act="qr" data-t="'+(ek==='assets'?'TS:':'VT:')+esc(ex.code)+'" data-c="'+esc(ex.code)+'" data-n="'+esc(ex.name)+'">Mã QR</button>':'')+
    (ex?'<button type="button" class="btn danger" data-act="delEnt" data-k="'+ek+'" data-id="'+esc(ex._id)+'" id="delBtn">Xóa</button>':'')+'</div><button type="submit" class="btn primary">Lưu</button></div></form>';
  showModal(h,{wide:wide,ek:ek,id:id||'',photo:v.photo||'',onSubmit:submitEnt});
  setTimeout(()=>{const n=$('#m_name');if(n&&!ex)n.focus()},30)}
function nextCode(pre,list){let max=0;list.forEach(r=>{const m=/(\d+)$/.exec(r.code||'');if(m)max=Math.max(max,+m[1])});return pre+String(max+1).padStart(3,'0')}
async function submitEnt(ev){
  ev.preventDefault();const ek=M.ek,id=M.id,err=m=>{$('#mErr').textContent=m};
  const code=mv('code').toUpperCase().replace(/\s+/g,''),name=mv('name');
  if(!H.validCode(code))return err('Mã gồm 2 đến 30 ký tự chữ, số, gạch ngang hoặc gạch dưới, không dấu, không khoảng trắng.');
  if(!name)return err('Hãy nhập tên.');
  if(!id&&listOf(ek).some(r=>r.code===code))return err('Mã '+code+' đã tồn tại.');
  let d={code:code,name:name};
  if(ek==='staff'){
    const cs=mv('contractStart'),ce=mv('contractEnd'),ct=mv('contractType');
    if(cs&&ce&&ce<cs)return err('Ngày hết hạn phải sau ngày hiệu lực.');
    if(!/không xác định/i.test(ct)&&!ce)return err('Hợp đồng có thời hạn cần ngày hết hạn để hệ thống nhắc đúng hạn.');
    Object.assign(d,{dept:mv('dept'),title:mv('title'),hometown:mv('hometown'),email:mv('email'),phone:mv('phone'),startDate:mv('startDate'),contractType:ct,contractNo:mv('contractNo'),contractStart:cs,contractEnd:/không xác định/i.test(ct)?'':ce,jobClass:mv('jobClass'),leaveExtra:Number(mv('leaveExtra')||0),status:mv('status'),role:mv('role')==='manager'?'manager':'employee',managerCode:mv('managerCode')});
    if(!id&&$('#m_mkacc')&&$('#m_mkacc').checked){
      if(!/^\S+@\S+\.\S+$/.test(d.email))return err('Hãy nhập email cá nhân hợp lệ để tạo tài khoản.');
      err('Đang tạo tài khoản…');
      try{const r=await window.ORI.adminUsers('create',{email:d.email.toLowerCase(),name:name});d.uid=r.uid;d.email=d.email.toLowerCase();M.newUid=r.uid;if(r.mailError)toast('Đã tạo tài khoản nhưng chưa gửi được email: '+r.mailError)}
      catch(e){return err('Không tạo được tài khoản: '+(e.message||'lỗi'))}}
    if(M.photoChanged)d.photo=M.photo;
  }else if(ek==='assets'){
    Object.assign(d,{cat:mv('cat'),serial:mv('serial'),buyDate:mv('buyDate'),value:mv('value')===''?'':Number(mv('value')),holder:mv('holder'),expectedLoc:mv('expectedLoc'),state:mv('state'),note:mv('note')});
  }else if(ek==='items'){
    Object.assign(d,{cat:mv('cat'),unit:mv('unit'),kho:mv('kho'),min:mv('min')===''?'':Number(mv('min'))});
  }else d.note=mv('note');
  const key=id||M.newUid||docId(ek,code),ref=S.db.doc(COL[ek]+'/'+key);
  const ok=await save(key,()=>id?ref.update(d):ref.set(Object.assign(ek==='staff'?{uid:null,att:{},photo:d.photo||''}:{},d,{createdAt:Date.now()})),'Đã lưu '+name);
  if(ok){if(ek==='staff')H.audit(id?'Sửa nhân viên':'Tạo tài khoản nhân viên',code+' · '+name+(d.role==='manager'?' · quản lý':''));closeModal()}}
function openQR(text,code,name){
  showModal(head('Mã QR '+esc(code))+'<div class="qrbox"><canvas id="qrc" width="320" height="320" style="max-width:100%"></canvas><b>'+esc(code)+'</b><span class="muted">'+esc(name||'')+'</span><span class="small muted">Nội dung mã: '+esc(text)+'</span></div><div class="actions"><span></span><button type="button" class="btn primary" data-act="qrSave" data-t="'+esc(text)+'" data-c="'+esc(code)+'" data-n="'+esc(name||'')+'">Tải ảnh nhãn</button></div>');
  const cv=$('#qrc');H.drawQR(cv.getContext('2d'),text,0,0,320)}
function openSig(title,sub,onOk){
  showModal(head(esc(title))+'<p class="muted" style="margin-bottom:10px">'+sub+'</p><canvas class="sig" id="sigc"></canvas><p class="err" id="sigErr"></p><div class="actions"><button type="button" class="btn" data-act="sigClear">Ký lại</button><button type="button" class="btn primary" data-act="sigOk">Xác nhận đã nhận</button></div>',{});
  M.sig=H.attachSig($('#sigc'));M.onOk=onOk}

/* ===== thao tác tài khoản, phiếu ===== */
const busy={};
function syncSigns(){
  if(!S.isAdmin)return;
  const need=new Set(S.issues.filter(i=>i.status!=='signed'&&i.empUid).map(i=>i.empUid));
  Object.keys(syncSigns.u).forEach(u=>{if(!need.has(u)){syncSigns.u[u]();delete syncSigns.u[u];delete S.signs[u]}});
  need.forEach(u=>{if(syncSigns.u[u])return;
    syncSigns.u[u]=S.db.collection('signs/'+u+'/rec').onSnapshot(s=>{S.signs[u]={};s.docs.forEach(d=>{S.signs[u][d.id]=d.data()});reconcile(u);render()},()=>{})})}
syncSigns.u={};
function reconcile(u){
  const sg=S.signs[u]||{};
  S.issues.forEach(i=>{if(i.empUid!==u||i.status==='signed')return;const s=sg[i._id];if(!s||busy[i._id])return;busy[i._id]=1;const at=s.at||Date.now();
    save('iss-'+i._id,()=>S.db.doc('issueLog/'+i._id).update({status:'signed',sig:s.sig||'',signedAt:at,signedBy:'app'}))
     .then(()=>save('iss-'+i._id,()=>S.db.doc('issues/'+u+'/rec/'+i._id).update({status:'signed',signedAt:at})))
     .then(()=>{delete busy[i._id]})})}
async function writeIssue(id,rec,sig,mode,photo){
  const signed=!!sig,at=Date.now(),full=Object.assign({},rec,{status:signed?'signed':'pending',createdAt:at});
  if(signed){full.sig=sig;full.signedAt=at;full.signedBy='admin-device'}
  const tx={item:rec.itemCode,itemName:rec.itemName,kho:rec.kho,type:'out',qty:rec.qty,date:rec.date,note:'Cấp phát cho '+rec.empName,cp:rec.empName,by:S.name||'',ev:!!photo,ref:id,at:at};
  if(photo&&!await putEv('tx'+id,{photo:photo,sig:sig||''}))return false;
  let ok=await save('tx'+id,()=>S.db.doc('stockTx/tx'+id).set(tx));if(!ok)return false;
  ok=await save('iss-'+id,()=>S.db.doc('issueLog/'+id).set(full));if(!ok)return false;
  if(rec.empUid)await save('iss-'+id,()=>S.db.doc('issues/'+rec.empUid+'/rec/'+id).set({itemName:rec.itemName,unit:rec.unit,qty:rec.qty,date:rec.date,note:rec.note,status:full.status,signedAt:full.signedAt||0,empName:rec.empName}));
  toast(signed?'Đã lập phiếu và ghi chữ ký':'Đã gửi phiếu, chờ nhân viên ký trên ứng dụng');return true}
async function doScan(raw){
  let t=String(raw||'').trim(),kind='asset',code=t;
  if(/^TS:/i.test(t))code=t.slice(3);else if(/^VT:/i.test(t)){kind='loc';code=t.slice(3)}
  code=code.toUpperCase().replace(/\s+/g,'');
  if(!code){S.scan.res={k:'warn',title:'Chưa đọc được mã',html:'Hãy chụp rõ mã QR hoặc nhập mã bằng tay.'};render();return}
  if(kind==='loc'){const l=S.locs.find(x=>x._id===code);
    if(!l)S.scan.res={k:'warn',title:'Không có vị trí '+code,html:'Mã vị trí này chưa có trong danh mục.'};
    else{S.scan.loc=l._id;S.scan.res={k:'ok',title:'Đã chọn vị trí',html:esc(l.name)+' ('+esc(l.code)+'). Giờ hãy quét tài sản.'}}
    render();return}
  const a=S.assets.find(x=>x._id===code);
  if(!a){S.scan.res={k:'warn',title:'Không có tài sản '+code,html:'Mã này chưa có trong danh mục tài sản.'};render();return}
  if(!S.scan.loc){S.scan.res={k:'warn',title:'Chưa chọn vị trí',html:'Chọn vị trí hiện tại ở bước 1 để biết tài sản đang đặt ở đâu.'};render();return}
  const ok=!!a.expectedLoc&&a.expectedLoc===S.scan.loc;
  const info=esc(a.code+' · '+a.name)+'<br>Đang ở: <b>'+esc(H.locName(S.scan.loc))+'</b>';
  if(!a.expectedLoc)S.scan.res={k:'warn',title:'Chưa gán vị trí chuẩn',html:info+'<br>Tài sản này chưa có vị trí chuẩn, hãy báo bộ phận quản trị.'};
  else if(ok)S.scan.res={k:'ok',title:'ĐÚNG CHỖ',html:info};
  else S.scan.res={k:'bad',title:'SAI CHỖ',html:info+'<br>Cần đưa về: <b>'+esc(H.locName(a.expectedLoc))+'</b>'};
  S.scan.hist.unshift({code:a.code,name:a.name,k:ok?'ok':a.expectedLoc?'bad':'warn',t:ok?'Đúng chỗ':a.expectedLoc?'Sai chỗ':'Chưa gán'});S.scan.hist=S.scan.hist.slice(0,20);
  render();
  const okw=await save('scan'+a._id,()=>S.db.doc('scans/'+a._id).set({code:a.code,loc:S.scan.loc,ok:ok,at:Date.now(),by:S.uid||''}));
  if(!okw)toast('Kết quả hiển thị đúng nhưng chưa lưu được lượt quét. Cần quyền Người đóng góp.')}

/* ===== nhập dữ liệu ===== */
function setImp(ek,rows){const r=H.mapRecords(ek,rows);S.imp=Object.assign({ek:ek,progress:null},r);render()}
async function impGo(){
  const imp=S.imp;if(!imp||!imp.recs.length||S.busy)return;S.busy='import';imp.progress=0;render();
  let add=0,upd=0,skip=0;const ek=imp.ek;
  for(const rec of imp.recs){
    const ex=listOf(ek).find(r=>r.code===rec.code),key=ex?ex._id:docId(ek,rec.code),ref=S.db.doc(COL[ek]+'/'+key);
    if(ex){const p=Object.assign({},rec);delete p.code;if(Object.keys(p).length){if(await save(key,()=>ref.update(p)))upd++}else skip++}
    else if(!rec.name)skip++;
    else{const d=Object.assign(ek==='staff'?{uid:null,att:{},status:'active',photo:''}:{},rec,{createdAt:Date.now()});if(await save(key,()=>ref.set(d)))add++}
    imp.progress++;if(imp.progress%4===0)render()}
  S.busy='';S.imp=null;toast('Đã thêm '+add+', cập nhật '+upd+(skip?', bỏ qua '+skip+' dòng thiếu tên':'')+'.');render()}
async function readFile(f,ek){
  const n=(f.name||'').toLowerCase();
  try{
    if(/\.(xlsx|xls)$/.test(n)){
      if(!window.XLSX){toast('Chưa tải được thư viện đọc Excel. Hãy lưu tệp dạng CSV hoặc dán dữ liệu.');return}
      const wb=XLSX.read(await f.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];
      setImp(ek,XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''}))}
    else setImp(ek,H.parseDelimited(await f.text()))
  }catch(e){toast('Không đọc được tệp này.')}}

/* ===== báo cáo, Google Sheets ===== */
async function doRep(id,toSheet){
  const r=H.REP.find(x=>x.id===id);if(!r)return;const b=r.build();
  if(!toSheet){await H.exportAoa(b.name,b.aoa,b.widths,b.merges);return}
  if(S.busy)return;S.busy='gs';toast('Đang ghi lên Google Sheets…');
  try{await H.gsPush(r.tab,b.aoa);toast('Đã ghi báo cáo vào tab '+r.tab)}catch(e){toast(H.gErr(e))}
  S.busy='';render()}
async function saveSettings(patch,msg){
  const next=Object.assign({},S.settings,patch);
  const ok=await save('settings',()=>S.db.doc('settings/general').set(next),msg);if(ok){S.settings=next;render()}}

/* ===== điều khiển ===== */
async function act(a,d){
  if(a!=='delHol'&&a!=='delTx'&&a!=='delIssue'&&a!=='delEnt')S.confirm='';
  switch(a){
    case 'burger':S.navOpen=!S.navOpen;render();break;
    case 'nav':S.page=d.p;S.navOpen=false;S.anim=true;H.spinLogo();ensureScan();if(d.p==='chat'){S.chat.open=false;H.chatSync()}render();window.scrollTo(0,0);break;
    case 'newStaff':openEnt('staff');break;case 'editStaff':openEnt('staff',d.id);break;
    case 'newAsset':openEnt('assets');break;case 'editAsset':openEnt('assets',d.id);break;
    case 'newItem':openEnt('items');break;case 'editItem':openEnt('items',d.id);break;
    case 'newLoc':openEnt('locs');break;case 'editLoc':openEnt('locs',d.id);break;
    case 'closeModal':closeModal();break;
    case 'rmPhoto':M.photo='';M.photoChanged=true;$('#m_av').innerHTML='<span class="avatar lg">'+esc(H.initials(mv('name')))+'</span>';break;
    case 'goAtt':S.attEmp=d.id;S.attMode='cal';S.page='att';closeModal();render();break;
    case 'goImport':S.form.ie=d.e||S.form.ie||'staff';S.page='import';S.imp=null;render();break;
    case 'delEnt':{
      const k='e'+d.id;if(S.confirm!==k){S.confirm=k;const b=$('#delBtn');if(b){b.textContent='Bấm lần nữa để xóa';b.classList.add('armed')}return}
      const old=d.k==='staff'?S.staff.find(x=>x._id===d.id):null;
      const ok=await save(d.id,()=>S.db.doc(COL[d.k]+'/'+d.id).delete(),'Đã xóa');if(ok){if(old){H.audit('Xóa nhân viên',old.code+' · '+old.name);if(old.uid){try{await window.ORI.adminUsers('delete',{uid:old.uid})}catch(e){toast('Đã xóa hồ sơ nhưng chưa xóa được tài khoản đăng nhập: '+(e.message||''))}}}closeModal()}break}
    case 'xEnt':{const E=H.ENT[d.e];await H.exportAoa('danh-sach-'+d.e,H.entAoa(d.e,true),E.cols.map(()=>18));break}
    case 'tplEnt':await H.exportAoa('mau-nhap-'+d.e,H.entAoa(d.e,false),H.ENT[d.e].cols.map(()=>18));break;
    case 'xRep':await doRep(d.id,false);break;
    case 'gRep':await doRep(d.id,true);break;
    case 'mprev':case 'mnext':{const k=a==='mprev'?-1:1;let m=S.month.m+k,y=S.month.y;if(m<1){m=12;y--}if(m>12){m=1;y++}S.month={y:y,m:m};render();break}
    case 'yprev':S.year--;render();break;case 'ynext':S.year++;render();break;
    case 'brush':S.brush=d.k;render();break;
    case 'attmode':S.attMode=d.k;render();break;
    case 'mcell':{
      const st=S.staff.find(s=>s._id===d.e);if(!st)return;const c=S.brush;
      if(c==='OT'){openOt(st,d.d);return}
      st.att=st.att||{};st.att[d.d]=c;
      const had=!!(st.out&&st.out[d.d]);if(c!=='T'&&had){delete st.out[d.d]}
      render();
      await save(st._id,()=>S.db.doc('staff/'+st._id).update(c!=='T'&&had?{att:{[d.d]:c},out:{[d.d]:{__delete__:true}}}:{att:{[d.d]:c}}));
      if(c==='T')openOut(st,d.d);break}
    case 'otDel':{const st=S.staff.find(s=>s._id===d.e);if(!st)return;if(st.ot)delete st.ot[d.d];
      if(await save(st._id,()=>S.db.doc('staff/'+st._id).update({ot:{[d.d]:{__delete__:true}}}),'Đã xóa tăng ca'))closeModal();render();break}
    case 'fill':{
      const st=S.staff.find(s=>s._id===S.attEmp);if(!st&&S.attMode==='cal')return;
      const list=S.attMode==='cal'?[st]:S.staff.filter(s=>s.status!=='left'),y=S.month.y,m=S.month.m,t=H.todayStr();let total=0;
      for(const s of list){const patch={};
        for(let dd=1;dd<=H.dim(y,m);dd++){const i=H.dayInfo(y,m,dd);if(i.s>t||i.off||i.hol)continue;if(!(s.att&&s.att[i.s]))patch[i.s]=i.half?'N':'X'}
        const n=Object.keys(patch).length;if(!n)continue;total+=n;s.att=Object.assign(s.att||{},patch);
        await save(s._id,()=>S.db.doc('staff/'+s._id).update({att:patch}))}
      toast(total?'Đã điền '+total+' ngày công':'Không còn ngày làm việc nào cần điền.');render();break}
    case 'seedHol':{const y=S.year;let n=0;
      for(const s of [['01-01','Tết Dương lịch'],['04-30','Ngày Giải phóng miền Nam'],['05-01','Quốc tế Lao động'],['09-02','Quốc khánh']]){const k=y+'-'+s[0];if(S.holidays[k])continue;if(await save('hol',()=>S.db.doc('holidays/'+k).set({name:s[1],date:k})))n++}
      toast(n?'Đã thêm '+n+' ngày lễ cố định':'Các ngày lễ cố định đã có sẵn.');break}
    case 'addHol':{const date=S.form.hDate||(S.year+'-01-01'),name=(S.form.hName||'').trim();
      if(!date||!name){toast('Hãy nhập ngày và tên ngày lễ.');return}
      if(await save('hol',()=>S.db.doc('holidays/'+date).set({name:name,date:date}),'Đã thêm công lễ')){S.year=+date.slice(0,4);S.form.hName='';render()}break}
    case 'delHol':{if(S.confirm!=='h'+d.d){S.confirm='h'+d.d;render();return}S.confirm='';await save('hol',()=>S.db.doc('holidays/'+d.d).delete(),'Đã xóa công lễ');render();break}
    case 'claim':{const code=(S.form.claimCode||'').trim().toUpperCase().replace(/\s+/g,'');
      if(!H.validCode(code)){S.form.claimErr='Mã nhân viên không hợp lệ.';render();return}
      const actv=(S.form.claimAct||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
      if(actv.length<8){S.form.claimErr='Hãy nhập mã kích hoạt do quản trị viên cấp.';render();return}
      S.form.claimErr='';
      if(!await save('claim',()=>S.db.doc('claims/'+S.uid).set({code:code,act:actv,at:Date.now()}))){S.form.claimErr='Tài khoản này chỉ có quyền xem. Nhờ quản trị viên chia sẻ lại với quyền Người đóng góp.';render()}break}
    case 'cancelClaim':await save('claim',()=>S.db.doc('claims/'+S.uid).delete());break;
    case 'approve':{
      const c=S.claims.find(x=>x._id===d.id);if(!c)return;const code=String(c.code||'').toUpperCase(),st=S.staff.find(s=>s.code===code&&!s.uid);
      if(!st){toast('Không có hồ sơ chưa liên kết với mã này.');return}
      if(!st.act||String(c.act||'').toUpperCase().replace(/[^A-Z0-9]/g,'')!==String(st.act).replace(/[^A-Z0-9]/g,'')){toast('Mã kích hoạt không khớp. Không thể duyệt.');return}
      if(S.staff.some(s=>s.uid===d.id)){toast('Tài khoản này đã liên kết với hồ sơ khác.');return}
      {const ae=String(S.emails[d.id]||'').toLowerCase(),pe=String(st.email||'').toLowerCase();if(ae&&pe&&ae!==pe){toast('Email tài khoản khác email cá nhân trong hồ sơ. Không thể duyệt.');return}}
      const data=Object.assign({},st);delete data._id;delete data.act;data.uid=d.id;
      if(await save(d.id,()=>S.db.doc('staff/'+d.id).set(data))){await save(st._id,()=>S.db.doc('staff/'+st._id).delete());
        await save('claim-'+d.id,()=>S.db.doc('claims/'+d.id).delete(),'Đã liên kết '+st.name);H.audit('Duyệt kích hoạt tài khoản',st.code+' · '+st.name)}break}
    case 'mkAcc':{const st=S.staff.find(x=>x._id===d.id);if(!st||st.uid)return;
      if(!/^\S+@\S+\.\S+$/.test(st.email||'')){toast('Hồ sơ chưa có email cá nhân hợp lệ. Mở Sửa để nhập email.');return}
      toast('Đang tạo tài khoản…');
      try{const r=await window.ORI.adminUsers('create',{email:st.email.toLowerCase(),name:st.name});
        const data=Object.assign({},st);delete data._id;data.uid=r.uid;data.email=st.email.toLowerCase();
        if(await save(r.uid,()=>S.db.doc('staff/'+r.uid).set(data))){await save(st._id,()=>S.db.doc('staff/'+st._id).delete());H.audit('Tạo tài khoản đăng nhập',st.code+' · '+data.email);toast(r.mailError?'Đã tạo tài khoản, chưa gửi được email: '+r.mailError:'Đã tạo tài khoản và gửi mã OTP tới '+data.email)}}
      catch(e){toast('Không tạo được tài khoản: '+(e.message||'lỗi'))}break}
    case 'sendOtp':{const st=S.staff.find(x=>x._id===d.id);if(!st||!st.email)return;
      try{await window.ORI.adminUsers('sendCode',{email:st.email});H.audit('Gửi mã OTP',st.code);toast('Đã gửi mã OTP tới '+st.email)}catch(e){toast('Chưa gửi được mã: '+(e.message||''))}break}
    case 'signOut':await window.ORI.signOut();break;
    case 'pwChange':{const a=S.form.npw||'',b=S.form.npw2||'';if(a.length<8){S.form.pwErr='Mật khẩu cần từ 8 ký tự.';render();return}if(a!==b){S.form.pwErr='Hai lần nhập chưa khớp.';render();return}
      try{await window.ORI.changePassword(a);S.form.npw=S.form.npw2='';S.form.pwErr='';toast('Đã đổi mật khẩu');render()}catch(e){S.form.pwErr='Chưa đổi được: '+(e.message||'');render()}break}
    case 'setLeft':{const st=S.staff.find(x=>x._id===d.id);if(!st)return;const k='l'+d.id;if(S.confirm!==k){S.confirm=k;toast('Bấm Cho nghỉ việc lần nữa để xác nhận khóa tài khoản '+st.name);return}S.confirm='';
      if(await save(st._id,()=>S.db.doc('staff/'+st._id).update({status:'left'}),'Đã khóa tài khoản '+st.name)){H.audit('Cho nghỉ việc',st.code+' · '+st.name);if(st.uid){try{await window.ORI.adminUsers('setDisabled',{uid:st.uid,disabled:true})}catch(e){toast('Chưa khóa được đăng nhập: '+(e.message||''))}}}break}
    case 'setActive':{const st=S.staff.find(x=>x._id===d.id);if(!st)return;if(await save(st._id,()=>S.db.doc('staff/'+st._id).update({status:'active'}),'Đã mở lại '+st.name)){H.audit('Cho làm việc lại',st.code);if(st.uid){try{await window.ORI.adminUsers('setDisabled',{uid:st.uid,disabled:false})}catch(e){toast('Chưa mở lại được đăng nhập: '+(e.message||''))}}}break}
    case 'chatOpen':S.chat.room=d.r;S.chat.open=true;S.chat.emo=false;S.chat.limit=60;S.chat.snap=true;H.chatSync();render();break;
    case 'chatBack':S.chat.open=false;render();break;
    case 'chatMore':S.chat.limit+=100;H.chatSync();break;
    case 'chatEmo':S.chat.emo=!S.chat.emo;render();break;
    case 'chatEmoji':S.form.chatText=(S.form.chatText||'')+d.e;render();{const t=document.getElementById('f_chatText');if(t)t.focus()}break;
    case 'chatSend':await sendMsg('');break;
    case 'teamPick':S.form.tm=d.id;render();break;
    case 'newRoom':{const ppl=Object.keys(S.dir).filter(u=>u!==S.uid).sort((a,b)=>S.dir[a].name.localeCompare(S.dir[b].name,'vi'));
      showModal(head('Tạo nhóm chat')+'<form id="mf"><div class="field"><label for="m_rname">Tên nhóm</label><input id="m_rname" maxlength="60" placeholder="Ví dụ: Tổ may 1, Kho, Kế toán"></div><div class="field"><label>Thành viên</label><div style="max-height:260px;overflow-y:auto;border:1px solid var(--line);border-radius:6px;padding:4px 10px">'+(ppl.length?ppl.map(u=>'<label class="chk"><input type="checkbox" name="mem" value="'+esc(u)+'"> '+esc(S.dir[u].name)+' <span class="small muted">'+esc(S.dir[u].code||'')+'</span></label>').join(''):'<p class="muted small">Chưa có tài khoản nào được kích hoạt.</p>')+'</div></div><p class="err" id="mErr"></p><div class="actions"><span></span><button type="submit" class="btn primary">Tạo nhóm</button></div></form>',{onSubmit:saveRoom});break}
    case 'chatExport':{const id=S.chat.room.slice(2),l=(S.msgs[id]||[]);const aoa=[['Thời gian','Người gửi','Nội dung','Có ảnh']].concat(l.map(m=>[H.fmtTs(m.t),H.nameDir(m.from),m.text||'',m.img?'Có':'']));await H.exportAoa('chat-'+id,aoa,[18,24,70,8]);break}
    case 'roomMem':{const r=S.rooms.find(x=>'g:'+x.id===S.chat.room);if(!r)return;const mem=r.members||[];
      const others=Object.keys(S.dir).filter(u=>mem.indexOf(u)<0).sort((a,b)=>S.dir[a].name.localeCompare(S.dir[b].name,'vi'));
      showModal(head('Thành viên · '+esc(r.name))+'<form id="mf"><p class="small muted">Đang có '+mem.length+' thành viên</p><div style="margin:6px 0 12px">'+mem.map(u=>'<span class="pill ok" style="margin:2px">'+esc(H.nameDir(u))+'</span>').join('')+'</div><div class="field"><label>Thêm người vào phòng</label><div style="max-height:240px;overflow-y:auto;border:1px solid var(--line);border-radius:6px;padding:4px 10px">'+(others.length?others.map(u=>'<label class="chk"><input type="checkbox" name="mem" value="'+esc(u)+'"> '+esc(S.dir[u].name)+' <span class="small muted">'+esc(S.dir[u].code||'')+'</span></label>').join(''):'<p class="muted small">Không còn ai để thêm.</p>')+'</div></div><p class="err" id="mErr"></p><div class="actions"><span></span><button type="submit" class="btn primary">Thêm vào phòng</button></div></form>',{onSubmit:ev=>saveMembers(ev,r.id)});break}
    case 'lockNow':showLock();break;
    case 'pinOn':{const f=S.form;if(!/^\d{4,8}$/.test(f.pin1||'')){S.form.pinErr='Mã PIN gồm 4 đến 8 chữ số.';render();return}
      if(f.pin1!==f.pin2){S.form.pinErr='Hai lần nhập mã PIN chưa khớp.';render();return}
      const salt=H.uid8()+H.uid8(),h=await H.sha(salt+f.pin1);try{localStorage.setItem('ori-pin-'+S.uid,JSON.stringify({s:salt,h:h,min:Number(f.pmin||5)}))}catch(e){S.form.pinErr='Trình duyệt không cho lưu mã PIN.';render();return}
      S.form.pin1=S.form.pin2='';S.form.pinErr='';armIdle();toast('Đã bật khóa PIN');render();break}
    case 'pinOff':try{localStorage.removeItem('ori-pin-'+S.uid)}catch(e){}clearTimeout(idleT);toast('Đã tắt khóa PIN');render();break;
    case 'rmLogo':saveSettings({logo:''},'Đã bỏ logo tải lên');break;
    case 'reject':await save('claim-'+d.id,()=>S.db.doc('claims/'+d.id).delete(),'Đã từ chối yêu cầu');break;
    case 'qr':openQR(d.t,d.c,d.n);break;
    case 'qrSave':{if(!S.dl){toast('Chưa hỗ trợ tải xuống.');return}const cv=H.labelSheet([{text:d.t,code:d.c,name:d.n,sub:''}],1);
      try{await S.dl.save({filename:'nhan-qr-'+d.c+'.png',data:await H.canvasBlob(cv)});toast('Đã lưu ảnh nhãn')}catch(e){if(!e||e.code!=='declined')toast('Không tải được ảnh.')}break}
    case 'lblAssets':case 'lblLocs':{
      const isA=a==='lblAssets',src=isA?S.assets:S.locs;if(!src.length){toast(isA?'Chưa có tài sản nào.':'Chưa có vị trí nào.');return}
      if(!S.dl){toast('Chưa hỗ trợ tải xuống.');return}
      const cv=H.labelSheet(src.slice().sort(H.byCode).map(r=>({text:(isA?'TS:':'VT:')+r.code,code:r.code,name:r.name,sub:isA?(r.expectedLoc?'Vị trí: '+(S.locs.find(l=>l._id===r.expectedLoc)||{name:r.expectedLoc}).name:''):(r.note||'')})),3);
      try{await S.dl.save({filename:isA?'nhan-qr-tai-san.png':'nhan-qr-vi-tri.png',data:await H.canvasBlob(cv)});toast('Đã lưu ảnh nhãn')}catch(e){if(!e||e.code!=='declined')toast('Không tải được ảnh.')}break}
    case 'scanManual':doScan(S.form.scanCode);break;
    case 'addTx':{const f=S.form,it=S.items.find(i=>i._id===(f.tItem||(S.items[0]&&S.items[0]._id)));if(!it)return;
      const type=f.tType||'in';let q=Number(f.tQty);
      if(!q||(type!=='adj'&&q<0)){toast('Nhập số lượng hợp lệ.');return}
      const bal=H.stockMap()[it.code]||0;
      if(type==='out'&&bal<q){toast('Tồn kho chỉ còn '+bal+' '+(it.unit||'')+', không đủ để xuất.');return}
      if(type==='adj'&&bal+q<0){toast('Điều chỉnh làm tồn kho âm, hãy kiểm tra lại số lượng.');return}
      if(!(f.tCp||'').trim()){toast('Nhập người giao hoặc người nhận hàng.');return}
      if(type==='adj'&&!(f.tNote||'').trim()){toast('Điều chỉnh cần ghi lý do.');return}
      if(!f.tPhoto){toast('Hãy chụp ảnh hàng thực tế trước khi ghi phiếu.');return}
      const id='tx'+H.uid8(),cp=f.tCp.trim(),photo=f.tPhoto,after=bal+(type==='out'?-q:q);
      openSig('Xác nhận '+(type==='in'?'nhập kho':type==='out'?'xuất kho':'điều chỉnh kho'),'<b>'+esc(cp)+'</b> ký xác nhận '+(type==='in'?'đã giao':type==='out'?'đã nhận':'điều chỉnh')+' <b>'+Math.abs(q)+' '+esc(it.unit||'')+' '+esc(it.name)+'</b>. Tồn sau phiếu: <b>'+after+'</b>.',async sig=>{
        if(!await putEv(id,{photo:photo,sig:sig}))return false;
        const ok=await save(id,()=>S.db.doc('stockTx/'+id).set({item:it.code,itemName:it.name,kho:it.kho,type:type,qty:q,date:f.tDate||H.todayStr(),note:(f.tNote||'').trim(),cp:cp,by:S.name||'',ev:true,at:Date.now()}),'Đã ghi phiếu kèm ảnh và chữ ký');
        if(ok){f.tQty='';f.tNote='';f.tCp='';f.tPhoto='';H.audit('Phiếu kho '+type,it.code+' · '+q+' · '+cp);return true}return false});break}
    case 'voidTx':{const t=S.tx.find(x=>x._id===d.id);if(!t||t.void||t.ref||t.evId)return;
      showModal(head('Hủy phiếu kho')+'<form id="mf"><p class="muted" style="margin-bottom:10px">Phiếu hủy vẫn được lưu để đối chiếu nhưng không còn tính vào tồn kho.</p>'+mi('vreason','Lý do hủy *','text','','maxlength="120"')+'<p class="err" id="mErr"></p><div class="actions"><span></span><button class="btn danger" type="submit">Hủy phiếu</button></div></form>',{onSubmit:async ev=>{ev.preventDefault();const r=mv('vreason');
        if(!r){$('#mErr').textContent='Nhập lý do hủy.';return}
        const q=Number(t.qty)||0,eff=t.type==='out'?-q:q;if((H.stockMap()[t.item]||0)-eff<0){$('#mErr').textContent='Hủy phiếu này làm tồn kho âm. Hãy hủy các phiếu xuất sau nó trước.';return}
        if(await save(t._id,()=>S.db.doc('stockTx/'+t._id).update({void:true,voidReason:r,voidAt:Date.now(),voidBy:S.name||''}),'Đã hủy phiếu')){H.audit('Hủy phiếu kho',t.item+' · '+t.qty+' · '+r);closeModal()}}});break}
    case 'bNew':S.form.bnew=true;S.form.bTo=[];S.form.bPhotos=[];render();break;
    case 'bCancel':S.form.bnew=false;render();break;
    case 'bTo':{const a=S.form.bTo||[],i=a.indexOf(d.k);if(i>=0)a.splice(i,1);else a.push(d.k);S.form.bTo=a;break}
    case 'bCreate':{const f=S.form,title=(f.bTitle||'').trim(),to=(f.bTo||[]).slice();
      if(!title){toast('Nhập tiêu đề phiếu.');return}if(!to.length){toast('Chọn ít nhất một bộ phận nhận.');return}
      const now=Date.now(),id='b'+H.uid8(),ph=(f.bPhotos||[]).slice(0,3),dt=new Date(now),code='PH'+String(dt.getFullYear()).slice(2)+H.pad(dt.getMonth()+1)+H.pad(dt.getDate())+'-'+id.slice(-3).toUpperCase();
      for(let n=0;n<ph.length;n++){if(!await save('bev'+id,()=>S.db.doc('boardEv/'+id+'-'+(n+1)).set({photo:ph[n]})))return}
      const t={code:code,type:f.bType||'request',sev:f.bSev||'normal',from:f.bFrom||'Ban giám đốc',to:to,title:title,body:(f.bBody||'').trim(),ref:(f.bRef||'').trim(),qty:(f.bQty||'').trim(),status:'new',by:S.uid,at:now,upd:now,last:S.uid,n:0,photos:ph.length};
      if(await save(id,()=>S.db.doc('board/'+id).set(t),'Đã gửi phiếu '+code)){
        await save('bm'+id,()=>S.db.doc('boardmsg/'+id+'/m/m0').set({from:S.uid,t:now,sys:1,text:'Tạo phiếu gửi tới '+to.join(', ')}));
        ['bTitle','bBody','bRef','bQty'].forEach(k=>f[k]='');f.bTo=[];f.bPhotos=[];f.bnew=false;f.bt=id;boardSync(id);render()}break}
    case 'bOpen':S.form.bt=d.id;S.form.bnew=false;S.form.bText='';S.form.bcPhoto='';S.chat.snap=true;boardSync(d.id);render();break;
    case 'bBack':S.form.bt='';render();break;
    case 'bSend':{const id=S.form.bt,tk=S.board.find(x=>x._id===id);if(!tk)return;const text=(S.form.bText||'').trim(),img=S.form.bcPhoto||'';if(!text&&!img)return;
      const t=Date.now(),mid='m'+H.uid8(),m={from:S.uid,t:t,text:text};if(img)m.img=img;S.form.bText='';S.form.bcPhoto='';S.chat.snap=true;render();
      if(await save('bm'+id,()=>S.db.doc('boardmsg/'+id+'/m/'+mid).set(m)))await save('b'+id,()=>S.db.doc('board/'+id).update({upd:t,last:S.uid,n:(tk.n||0)+1}));break}
    case 'bStatus':{const id=S.form.bt,tk=S.board.find(x=>x._id===id);if(!tk)return;const t=Date.now(),to=d.s,L=H.BS;
      if(await save('b'+id,()=>S.db.doc('board/'+id).update({status:to,upd:t,last:S.uid,n:(tk.n||0)+1}),'Đã cập nhật trạng thái')){
        await save('bm'+id,()=>S.db.doc('boardmsg/'+id+'/m/s'+H.uid8()).set({from:S.uid,t:t,sys:1,text:'đổi trạng thái '+(L[tk.status]||['?'])[0]+' → '+L[to][0]}));S.chat.snap=true}break}
    case 'bExport':{const L=H.BS,T=H.BT,V=H.BV,aoa=[['Mã phiếu','Ngày tạo','Loại','Mức độ','Từ bộ phận','Gửi đến','Tiêu đề','Nội dung','Liên quan','Số lượng ảnh hưởng','Trạng thái','Người tạo','Cập nhật cuối','Số trao đổi']].concat(S.board.slice().sort((a,b)=>a.at-b.at).map(t=>[t.code,H.fmtTs(t.at),T[t.type]||'',(V[t.sev]||[''])[0],t.from||'',(t.to||[]).join(', '),t.title,t.body||'',t.ref||'',t.qty||'',(L[t.status]||[''])[0],H.nameDir(t.by),H.fmtTs(t.upd),t.n||0]));
      await H.exportAoa('luu-tru-phieu-phoi-hop',aoa,[16,18,22,12,14,26,36,50,22,16,22,22,18,10]);break}
    case 'viewEv':{const t=S.tx.find(x=>x._id===d.id);showModal(head('Chứng từ kho')+'<p class="muted">Đang tải…</p>');
      const ev=await getEv(t&&t.evId?t.evId:d.id);
      showModal(head('Chứng từ kho')+(t?'<div class="line"><span>Ngày</span><span>'+fmt(t.date)+'</span></div><div class="line"><span>Vật tư</span><span>'+esc(t.item+' · '+(t.itemName||''))+'</span></div><div class="line"><span>Loại, số lượng</span><span>'+(t.type==='in'?'Nhập':t.type==='out'?'Xuất':'Điều chỉnh')+' '+esc(t.qty)+'</span></div><div class="line"><span>Người giao / nhận</span><span>'+esc(t.cp||'—')+'</span></div><div class="line"><span>Người lập phiếu</span><span>'+esc(t.by||'—')+'</span></div><div class="line"><span>Ghi chú</span><span>'+esc(t.note||'—')+'</span></div>'+(t.void?'<div class="alert bad"><div class="t"><b>Đã hủy</b><span class="small">'+esc(t.voidReason||'')+' · '+esc(t.voidBy||'')+' · '+H.fmtTs(t.voidAt)+'</span></div></div>':''):'')+
        (ev&&ev.photo?'<p class="small muted" style="margin-top:10px">Ảnh hàng thực tế</p><img alt="Ảnh hàng thực tế" src="'+esc(ev.photo)+'" style="max-width:100%;border-radius:8px">':'<p class="muted" style="margin-top:10px">Không có ảnh lưu kèm.</p>')+
        (ev&&ev.sig?'<p class="small muted" style="margin-top:10px">Chữ ký xác nhận</p><img alt="Chữ ký" src="'+esc(ev.sig)+'" style="max-width:100%;border:1px solid var(--line);border-radius:6px;background:#fff">':''),{});break}
    case 'viewKK':{const k=S.stocktakes.find(x=>x._id===d.id);if(!k)return;showModal(head('Kiểm kê kho')+'<p class="muted">Đang tải…</p>',{wide:true});
      const evs=await getEv(k._id),ph=[];for(let n=1;n<=(k.photos||0);n++){const p=await getEv(k._id+'-p'+n);if(p&&p.photo)ph.push(p.photo)}
      showModal(head('Kiểm kê kho '+fmt(k.date))+'<div class="line"><span>Kho</span><span>'+esc(k.kho==='all'?'Tất cả kho':k.kho)+'</span></div><div class="line"><span>Người kiểm kê</span><span>'+esc(k.counter)+'</span></div><div class="line"><span>Người chứng kiến</span><span>'+esc(k.witness)+'</span></div>'+
        '<div class="tbl-wrap" style="margin-top:10px"><table class="tbl"><thead><tr><th>Mã</th><th>Vật tư</th><th class="r">Sổ sách</th><th class="r">Thực đếm</th><th class="r">Chênh lệch</th></tr></thead><tbody>'+(k.lines||[]).map(l=>'<tr><td>'+esc(l.code)+'</td><td>'+esc(l.name)+'</td><td class="r">'+esc(l.book)+'</td><td class="r">'+esc(l.actual)+'</td><td class="r">'+(l.diff===0?'Khớp':(l.diff>0?'+':'')+esc(l.diff))+'</td></tr>').join('')+'</tbody></table></div>'+
        (ph.length?'<p class="small muted" style="margin-top:10px">Ảnh kiểm kê thực tế</p><div style="display:flex;gap:8px;flex-wrap:wrap">'+ph.map(p=>'<img alt="Ảnh kiểm kê" src="'+esc(p)+'" style="max-width:48%;border-radius:8px">').join('')+'</div>':'')+
        (evs&&evs.sigs?'<div class="grid2" style="margin-top:10px"><div><p class="small muted">Chữ ký người kiểm kê</p><img alt="Chữ ký" src="'+esc(evs.sigs.counter)+'" style="max-width:100%;border:1px solid var(--line);background:#fff;border-radius:6px"></div><div><p class="small muted">Chữ ký người chứng kiến</p><img alt="Chữ ký" src="'+esc(evs.sigs.witness)+'" style="max-width:100%;border:1px solid var(--line);background:#fff;border-radius:6px"></div></div>':''),{wide:true});break}
    case 'evClear':if(d.k==='kPhotos')S.form.kPhotos=[];else delete S.form[d.k];render();break;
    case 'ktClear':Object.keys(S.form).forEach(k=>{if(k.indexOf('cnt_')===0)delete S.form[k]});render();break;
    case 'ktDone':{const f=S.form,kho=f.kKho||'all',its=S.items.filter(i=>kho==='all'||i.kho===kho).sort(H.byCode),sm=H.stockMap(),lines=[];
      its.forEach(i=>{const v=f['cnt_'+i.code];if(v===undefined||v==='')return;const n=Number(v);if(isNaN(n)||n<0)return;const book=sm[i.code]||0;lines.push({code:i.code,name:i.name,unit:i.unit||'',kho:i.kho||'',book:book,actual:n,diff:Math.round((n-book)*1000)/1000})});
      if(!lines.length){toast('Nhập số thực đếm cho ít nhất một vật tư.');return}
      if(!(f.kWitness||'').trim()){toast('Nhập tên người chứng kiến.');return}
      if(!(f.kPhotos&&f.kPhotos.length)){toast('Hãy chụp ít nhất một ảnh kiểm kê thực tế.');return}
      const counter=(f.kCounter||S.name||'').trim()||'Thủ kho',witness=f.kWitness.trim(),date=f.kDate||H.todayStr(),id='kk'+H.uid8(),diffs=lines.filter(l=>l.diff!==0),photos=f.kPhotos.slice();
      openSig('Người kiểm kê ký: '+counter,'Xác nhận số liệu thực đếm của <b>'+lines.length+'</b> vật tư, <b>'+diffs.length+'</b> dòng chênh lệch so với sổ sách.',s1=>{
        setTimeout(()=>openSig('Người chứng kiến ký: '+witness,'Chứng kiến việc kiểm đếm thực tế và đồng ý với kết quả.',async s2=>{
          if(!await putEv(id,{sigs:{counter:s1,witness:s2}}))return false;
          for(let n=0;n<photos.length;n++){if(!await putEv(id+'-p'+(n+1),{photo:photos[n]}))return false}
          if(!await save(id,()=>S.db.doc('stocktakes/'+id).set({date:date,kho:kho,counter:counter,witness:witness,lines:lines,photos:photos.length,by:S.name||'',at:Date.now(),applied:false})))return false;
          for(const l of diffs){const tid='tx'+H.uid8();
            if(!await save(tid,()=>S.db.doc('stockTx/'+tid).set({item:l.code,itemName:l.name,kho:l.kho,type:'adj',qty:l.diff,date:date,note:'Kiểm kê: sổ sách '+l.book+', thực tế '+l.actual,cp:counter+' / '+witness,by:S.name||'',ev:true,evId:id,at:Date.now()}))){toast('Ghi chênh lệch bị dừng giữa chừng. Mở Lịch sử kiểm kê để kiểm tra đợt '+id+'.');return false}}
          await save(id,()=>S.db.doc('stocktakes/'+id).update({applied:true}));
          H.audit('Kiểm kê kho',(kho==='all'?'Tất cả kho':kho)+' · '+lines.length+' dòng · '+diffs.length+' chênh lệch');
          Object.keys(f).forEach(k=>{if(k.indexOf('cnt_')===0)delete f[k]});f.kPhotos=[];f.kWitness='';
          toast(diffs.length?'Đã kiểm kê, điều chỉnh '+diffs.length+' dòng chênh lệch':'Kiểm kê khớp hoàn toàn');render();return true}),150);
        return true});break}
    case 'addIssue':{
      const f=S.form,emps=S.staff.filter(s=>s.status!=='left').sort(H.byCode),its=S.items.slice().sort(H.byCode);
      const emp=S.staff.find(s=>s._id===(f.iEmp||(emps[0]&&emps[0]._id))),it=S.items.find(i=>i._id===(f.iItem||(its[0]&&its[0]._id))),qty=Number(f.iQty);
      if(!emp||!it)return;if(!(qty>0)){toast('Nhập số lượng lớn hơn 0.');return}
      if(!f.iPhoto){toast('Hãy chụp ảnh hàng thực tế đang giao trước khi lập phiếu.');return}
      const photo=f.iPhoto;
      if((H.stockMap()[it.code]||0)<qty){toast('Tồn kho chỉ còn '+(H.stockMap()[it.code]||0)+' '+(it.unit||'')+', không đủ để cấp.');return}
      const rec={empId:emp._id,empUid:emp.uid||'',empCode:emp.code,empName:emp.name,itemCode:it.code,itemName:it.name,unit:it.unit||'',kho:it.kho||'',qty:qty,date:f.iDate||H.todayStr(),note:(f.iNote||'').trim()},id='is'+H.uid8();
      const now=(f.iMode==='now')||!emp.uid;
      if(!now){if(await writeIssue(id,rec,'',false,photo)){f.iQty='';f.iPhoto='';render()}break}
      openSig('Ký nhận: '+emp.name,'Giao cho <b>'+esc(emp.name)+'</b>: <b>'+qty+' '+esc(it.unit||'')+' '+esc(it.name)+'</b>. Người nhận ký vào khung dưới đây.',async sig=>{if(await writeIssue(id,rec,sig,true,photo)){f.iQty='';f.iPhoto='';return true}return false});break}
    case 'delIssue':{
      if(S.confirm!=='i'+d.id){S.confirm='i'+d.id;render();return}S.confirm='';
      const i=S.issues.find(x=>x._id===d.id);if(!i)return;
      await save('tx'+d.id,()=>S.db.doc('stockTx/tx'+d.id).update({void:true,voidReason:'Xóa phiếu cấp phát',voidAt:Date.now(),voidBy:S.name||''}));H.audit('Xóa phiếu cấp phát',i.empCode+' · '+i.itemName+' · '+i.qty);await save('iss-'+d.id,()=>S.db.doc('issueLog/'+d.id).delete());
      if(i.empUid)await save('iss-'+d.id,()=>S.db.doc('issues/'+i.empUid+'/rec/'+d.id).delete());
      toast('Đã xóa phiếu và hoàn lại tồn kho');render();break}
    case 'viewSig':{const i=S.issues.find(x=>x._id===d.id);if(!i)return;
      showModal(head('Chữ ký nhận')+'<div class="line"><span>Người nhận</span><span>'+esc(i.empCode+' · '+i.empName)+'</span></div><div class="line"><span>Vật tư</span><span>'+esc(i.itemName)+', '+esc(i.qty)+' '+esc(i.unit||'')+'</span></div><div class="line"><span>Ngày cấp</span><span>'+fmt(i.date)+'</span></div><div class="line"><span>Ký lúc</span><span>'+H.fmtTs(i.signedAt||(S.signs[i.empUid]&&S.signs[i.empUid][i._id]&&S.signs[i.empUid][i._id].at))+'</span></div><div style="margin-top:10px;background:#fff;border:1px solid var(--line);border-radius:4px;padding:6px;text-align:center">'+(H.issSig(i)?'<img alt="Chữ ký" style="max-width:100%" src="'+esc(H.issSig(i))+'">':'<span class="muted">Chưa tải được ảnh chữ ký</span>')+'</div>');break}
    case 'signIssue':{const i=S.myIssues.find(x=>x._id===d.id);if(!i)return;
      openSig('Ký nhận vật tư','Bạn xác nhận đã nhận <b>'+esc(i.qty)+' '+esc(i.unit||'')+' '+esc(i.itemName)+'</b> ngày '+fmt(i.date)+'.',async sig=>{
        const at=Date.now();if(!await save('sign'+d.id,()=>S.db.doc('signs/'+S.uid+'/rec/'+d.id).set({sig:sig,at:at}),'Đã ký nhận')){return false}
        S.mySigns[d.id]={sig:sig,at:at};render();return true});break}
    case 'sigClear':M.sig&&M.sig.clear();break;
    case 'sigOk':{if(!M.sig||M.sig.isEmpty()){$('#sigErr').textContent='Hãy ký vào khung trước khi xác nhận.';return}
      const cb=M.onOk,s=M.sig.data();if(cb&&await cb(s))closeModal();break}
    case 'saveInfo':await saveSettings({company:(S.form.company!=null?S.form.company:S.settings.company||'').trim(),address:(S.form.address!=null?S.form.address:S.settings.address||'').trim(),sheetId:(S.form.sheetId!=null?S.form.sheetId:S.settings.sheetId||'').trim()},'Đã lưu thông tin');break;
    case 'gsCheck':{S.form.gsMsg='Đang kiểm tra…';render();
      try{await saveSettings({sheetId:(S.form.sheetId!=null?S.form.sheetId:S.settings.sheetId||'').trim()});const r=await H.gsTabs(),need=['NhanVien','TaiSan','VatTu','ViTri'].concat(H.REP.map(x=>x.tab)),miss=need.filter(t=>r.tabs.indexOf(t)<0);
        S.form.gsMsg='Kết nối được tệp "'+r.title+'". '+(miss.length?'Còn thiếu các tab: '+miss.join(', ')+'. Hãy tạo thêm trong Google Sheets.':'Đủ tất cả các tab cần dùng.')}
      catch(e){S.form.gsMsg=H.gErr(e)}render();break}
    case 'impPaste':{const t=S.form.paste||'';if(!t.trim()){toast('Hãy dán dữ liệu trước.');return}setImp(S.form.ie||'staff',H.parseDelimited(t));break}
    case 'impSheet':{const ek=S.form.ie||'staff';toast('Đang đọc Google Sheets…');
      try{await saveSettings({sheetId:S.settings.sheetId||''});setImp(ek,await H.gsPull(H.ENT[ek].tab))}catch(e){toast(H.gErr(e))}break}
    case 'impGo':await impGo();break;
  }
}
function ensureScan(){
  if(S.isAdmin||S.page!=='scan'||S.scanSubs||!S.db)return;S.scanSubs=true;
  S.db.collection('assets').onSnapshot(s=>{S.assets=mapDocs(s);render()},()=>{});
  S.db.collection('locations').onSnapshot(s=>{S.locs=mapDocs(s);render()},()=>{});
  S.db.collection('scans').onSnapshot(s=>{S.scans={};s.docs.forEach(d=>{S.scans[d.id]=d.data()});render()},()=>{})}
const mapDocs=s=>s.docs.map(d=>Object.assign({_id:d.id},d.data()));

/* ===== sự kiện giao diện ===== */
const app=$('#app');
app.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;if(b.dataset.act==='chatZoom'){showModal(head('Hình ảnh')+'<img alt="Hình ảnh" src="'+esc(b.getAttribute('src'))+'" style="max-width:100%;border-radius:8px">',{});return}act(b.dataset.act,b.dataset)});
app.addEventListener('keydown',e=>{if(e.target.id==='f_chatText'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();S.form.chatText=e.target.value;sendMsg('')}});
$('#scrim').addEventListener('click',()=>{S.navOpen=false;render()});
const RERENDER={q:1,af:1,cf:1,ie:1,tItem:0,kKho:1,tType:1,bfDept:1,bfType:1,bfSev:1,bfStatus:1};
function bind(e){const t=e.target;
  if(t.dataset&&t.dataset.f){S.form[t.dataset.f]=t.value;if(t.dataset.f.indexOf('cnt_')===0&&e.type==='change'){render();return}if(RERENDER[t.dataset.f]&&(e.type==='input'||t.tagName==='SELECT')){if(t.dataset.f==='ie')S.imp=null;render()}}}
app.addEventListener('input',bind);app.addEventListener('change',bind);
app.addEventListener('change',async e=>{const t=e.target;
  if(t.dataset&&t.dataset.ev&&t.files[0]){const k=t.dataset.ev,f=t.files[0];t.value='';
    try{const u=await resizeImg(f,190000);if(!u){toast('Không nén được ảnh, hãy chụp lại.');return}
      if(t.dataset.multi){S.form[k]=(S.form[k]||[]).concat(u).slice(0,4)}else S.form[k]=u;render()}catch(er){toast('Không đọc được ảnh này.')}}
  else if(t.id==='attEmp'){S.attEmp=t.value;render()}
  else if(t.id==='chatImg'&&t.files[0]){const f=t.files[0];t.value='';
    if(!/^image\//.test(f.type)){toast('Chỉ gửi được tệp ảnh.');return}
    if(f.size>5*1024*1024){toast('Ảnh vượt quá 5 MB, hãy chọn ảnh nhỏ hơn.');return}
    toast('Đang gửi ảnh…');let img='',iid='';
    if(S.upl){try{const r=await S.upl.upload(f);img=r.url;iid=r.id}catch(er){img=''}}
    if(!img){try{img=await resizeImg(f)}catch(er){img=''}if(img)toast('Ảnh được nén nhỏ vì chưa tải nguyên bản được.')}
    if(!img){toast('Chưa gửi được ảnh này.');return}
    await sendMsg(img,iid)}
  else if(t.id==='logoFile'&&t.files[0]){const f=t.files[0];t.value='';try{const u=await H.cropPhoto(f,300);saveSettings({logo:u},'Đã cập nhật logo')}catch(er){toast('Không đọc được ảnh này.')}}
  else if(t.id==='sat'){saveSettings({sat:t.value},'Đã lưu quy ước tuần làm việc')}
  else if(t.id==='scanLoc'){S.scan.loc=t.value;S.scan.res=null;render()}
  else if(t.id==='impFile'&&t.files[0]){await readFile(t.files[0],S.form.ie||'staff');t.value=''}
  else if((t.id==='scanAssetFile'||t.id==='scanLocFile')&&t.files[0]){
    const f=t.files[0];t.value='';
    try{const txt=await H.decodeQR(f);if(!txt){S.scan.res={k:'warn',title:'Không đọc được mã QR',html:'Chụp lại gần hơn, đủ sáng, mã nằm trọn trong khung ảnh.'};render()}else doScan(txt)}
    catch(er){S.scan.res={k:'warn',title:'Chưa đọc được ảnh',html:er==='nolib'?'Chưa tải được thư viện đọc mã QR. Hãy nhập mã bằng tay.':'Ảnh không mở được, thử lại.'};render()}}});
$('#modal').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;if(b.classList.contains('overlay')&&e.target!==b)return;act(b.dataset.act,b.dataset)});
$('#modal').addEventListener('submit',e=>{if(M.onSubmit)M.onSubmit(e)});
$('#modal').addEventListener('change',async e=>{
  if(e.target.id==='m_photo'&&e.target.files[0]){try{M.photo=await H.cropPhoto(e.target.files[0],240);M.photoChanged=true;$('#m_av').innerHTML='<img class="avatar lg" alt="" src="'+esc(M.photo)+'">'}catch(er){toast('Không đọc được ảnh này.')}e.target.value=''}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal()});

/* ===== tăng ca, công tác ngoài nhà máy ===== */
function dInfo(date){return H.dayInfo(+date.slice(0,4),+date.slice(5,7),+date.slice(8,10))}
function openOt(st,date){
  const i=dInfo(date),cur=(st.ot&&st.ot[date])||null,kind=H.otDayKind(i)+(i.hol?' ('+esc(i.hol.name)+')':'');
  showModal(head('Tăng ca · '+esc(st.name))+'<form id="mf"><p class="muted" style="margin-bottom:10px">'+fmt(date)+' · '+kind+' · hệ số '+H.otRate(i,null)+'%</p><div class="grid2">'+mi('oth','Số giờ tăng ca, làm thêm','number',cur?cur.h:2,'step="0.5" min="0.5" max="12"')+
    '<div class="field"><label>Ca đêm</label><label class="chk"><input type="checkbox" id="m_otn"'+(cur&&cur.n?' checked':'')+'> Làm từ 22:00 đến 06:00 (cộng thêm 50%)</label></div>'+mi('otnote','Nội dung công việc','text',cur&&cur.note||'','maxlength="100"')+'</div><p class="err" id="mErr"></p><div class="actions"><div class="tools" style="border:0;padding:0;background:none">'+
    (cur?'<button type="button" class="btn danger" data-act="otDel" data-e="'+esc(st._id)+'" data-d="'+date+'">Xóa tăng ca</button>':'')+'</div><button type="submit" class="btn primary">Lưu</button></div></form>',{onSubmit:ev=>saveOt(ev,st._id,date)})}
async function saveOt(ev,id,date){ev.preventDefault();const st=S.staff.find(s=>s._id===id);if(!st)return;
  const h=Number(mv('oth')),err=m=>{$('#mErr').textContent=m};
  if(!(h>0)||h>12)return err('Số giờ phải lớn hơn 0 và tối đa 12.');
  const i=dInfo(date),rec={h:h,n:$('#m_otn').checked?1:0,note:mv('otnote')};
  st.ot=st.ot||{};st.ot[date]=rec;
  if(!await save(st._id,()=>S.db.doc('staff/'+st._id).update({ot:{[date]:rec}}),'Đã ghi tăng ca'))return;
  const m=H.summarize(st,+date.slice(0,4),+date.slice(5,7)).ot,yr=H.otYear(st,+date.slice(0,4));
  if(!i.off&&!i.hol&&h>4)toast('Lưu ý: ngày thường tăng ca quá 4 giờ thì tổng giờ làm trong ngày vượt 12 giờ.');
  else if(m>40||yr>200)toast('Cảnh báo: tăng ca đã vượt giới hạn ('+m+' giờ/tháng, '+yr+' giờ/năm; tối đa 40 và 200).');
  closeModal();render()}
function openOut(st,date){
  const cur=(st.out&&st.out[date])||{};
  showModal(head('Công tác ngoài nhà máy · '+esc(st.name))+'<form id="mf"><p class="muted" style="margin-bottom:10px">'+fmt(date)+'. Ngày này tính như một ngày công đầy đủ.</p><div class="grid2">'+mi('outp','Nơi làm việc (khách hàng, địa điểm)','text',cur.place,'maxlength="100"')+mi('outn','Nội dung công tác','text',cur.note,'maxlength="120"')+'</div><div class="actions"><span></span><button type="submit" class="btn primary">Lưu</button></div></form>',{onSubmit:async ev=>{ev.preventDefault();
    const rec={place:mv('outp'),note:mv('outn')};st.out=st.out||{};st.out[date]=rec;
    if(await save(st._id,()=>S.db.doc('staff/'+st._id).update({out:{[date]:rec}}),'Đã ghi công tác ngoài')){closeModal();render()}}})}
/* ===== bảng phối hợp: đồng bộ trao đổi và ảnh ===== */
function boardSync(id){
  if(!S.subs['b:'+id]){S.subs['b:'+id]=1;
    S.db.collection('boardmsg/'+id+'/m').orderBy('t','asc').limit(500).onSnapshot(s=>{S.bmsgs[id]=s.docs.map(d=>Object.assign({_id:d.id},d.data()));render()},()=>{})}
  const tk=S.board.find(x=>x._id===id);
  if(tk&&tk.photos&&!S.bimg[id]){S.bimg[id]=[];(async()=>{const a=[];for(let n=1;n<=tk.photos;n++){try{const d=await S.db.doc('boardEv/'+id+'-'+n).get();if(d.exists)a.push(d.data().photo)}catch(e){}}S.bimg[id]=a;render()})()}}
/* ===== chứng từ kho ===== */
async function putEv(id,data){return save('ev'+id,()=>S.db.doc('stockEv/'+id).set(Object.assign({at:Date.now()},data)))}
async function getEv(id){try{const d=await S.db.doc('stockEv/'+id).get();return d.exists?d.data():null}catch(e){return null}}
/* ===== chat, khóa PIN, đồng bộ mirror ===== */
function resizeImg(file,lim){lim=lim||200000;return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{URL.revokeObjectURL(u);for(const cfg of [[1000,.7],[900,.62],[720,.5],[560,.42],[440,.38]]){const k=Math.min(1,cfg[0]/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);const d=cv.toDataURL('image/jpeg',cfg[1]);if(d.length<=lim){res(d);return}}res(null)};
  im.onerror=()=>{URL.revokeObjectURL(u);rej()};im.src=u})}
async function sendMsg(img,imgId){
  const text=(S.form.chatText||'').trim().slice(0,2000),k=S.chat.room;
  if((!text&&!img)||!k||!S.uid)return;
  const id=H.uid8(),t=Date.now(),body={from:S.uid,t:t,text:text};if(img)body.img=img;if(imgId)body.imgId=imgId;
  S.form.chatText='';render();
  if(k.charAt(0)==='g'){const r=k.slice(2);await save('chat',()=>S.db.doc('chatmsg/'+r+'/m/'+id).set(body))}
  else{const p=k.slice(2);await save('chat',async()=>{await S.db.doc('dm/'+p+'/m/'+id).set(Object.assign({peer:S.uid,dir:'in'},body));await S.db.doc('dm/'+S.uid+'/m/'+id).set(Object.assign({peer:p,dir:'out'},body))})}}
async function saveMembers(ev,id){ev.preventDefault();const r=S.rooms.find(x=>x.id===id);if(!r)return;
  const add=Array.from(document.querySelectorAll('#modal input[name=mem]:checked')).map(x=>x.value);if(!add.length){$('#mErr').textContent='Chọn ít nhất một người.';return}
  if(await save('room',()=>S.db.doc('chatrooms/'+id).update({members:(r.members||[]).concat(add)}),'Đã thêm '+add.length+' người')){H.audit('Thêm thành viên phòng chat',r.name+' · +'+add.length);closeModal()}}
async function saveRoom(ev){ev.preventDefault();const name=mv('rname'),err=m=>{$('#mErr').textContent=m};
  if(!name)return err('Hãy nhập tên nhóm.');
  const mem=Array.from(document.querySelectorAll('#modal input[name=mem]:checked')).map(x=>x.value);if(!mem.length)return err('Chọn ít nhất một thành viên.');
  mem.push(S.uid);const id=H.uid8();
  if(await save('room',()=>S.db.doc('chatrooms/'+id).set({name:name,members:mem,by:S.uid,at:Date.now()}),'Đã tạo nhóm '+name)){H.audit('Tạo nhóm chat',name+' · '+mem.length+' thành viên');closeModal()}}
let idleT=null,hiddenAt=0,fails=0,lockUntil=0;
function armIdle(){clearTimeout(idleT);const c=H.pinCfg();if(!c||S.lock)return;idleT=setTimeout(showLock,c.min*60000)}
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,armIdle,{passive:true}));
document.addEventListener('visibilitychange',()=>{const c=H.pinCfg();if(document.hidden)hiddenAt=Date.now();else if(c&&hiddenAt&&Date.now()-hiddenAt>c.min*60000)showLock()});
function showLock(){
  const c=H.pinCfg();if(!c||S.lock)return;S.lock=true;app.inert=true;
  const el=document.createElement('div');el.id='lock';
  el.innerHTML='<form class="box" autocomplete="off">'+H.coin(120,1)+'<div class="wordmark" style="font-size:1.6rem">ORISTAR</div><p style="margin:0">Phiên làm việc đã khóa. Nhập mã PIN để tiếp tục.</p><input id="lockPin" type="password" inputmode="numeric" maxlength="8" aria-label="Mã PIN"><button class="btn primary" type="submit">Mở khóa</button><p class="err" id="lockErr" style="color:#ffb4a8;min-height:1.2em;margin:0"></p><div class="credit dark">APP Nội Bộ được làm bởi <b>Đào Duy Thanh</b> <span class="cc">c</span> since 2026</div></form>';
  document.body.appendChild(el);const pin=el.querySelector('#lockPin');setTimeout(()=>pin.focus(),50);
  el.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const er=el.querySelector('#lockErr');
    if(Date.now()<lockUntil){er.textContent='Thử lại sau '+Math.ceil((lockUntil-Date.now())/1000)+' giây.';return}
    const h=await H.sha(c.s+pin.value);pin.value='';
    if(h===c.h){fails=0;S.lock=false;app.inert=false;el.remove();H.spinLogo();armIdle()}
    else{fails++;er.textContent='Mã PIN chưa đúng.';if(fails>=5){lockUntil=Date.now()+30000;fails=0;er.textContent='Sai quá 5 lần. Chờ 30 giây.'}}})}
const hashStr=str=>{let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return (h>>>0).toString(36)+str.length};
let mirT=null,mirBusy=false;
function schedMirror(){if(!S.isAdmin)return;clearTimeout(mirT);mirT=setTimeout(syncMirrors,3500)}
async function syncMirrors(){
  if(!S.isAdmin||!S.ready||mirBusy)return;mirBusy=true;
  try{
    const want={},mgrs={};
    S.staff.forEach(s=>{if(s.role==='manager'&&s.uid&&s.status!=='left')mgrs[s.code]=s.uid});
    S.staff.forEach(s=>{
      if(s.uid&&s.status!=='left')want['directory/'+s.uid]={name:s.name,code:s.code,role:s.role==='manager'?'manager':'employee',dept:s.dept||''};
      const mu=s.managerCode&&mgrs[s.managerCode];
      if(mu&&s._id){const c=Object.assign({},s);delete c._id;delete c.act;delete c.createdAt;want['team/'+mu+'/m/'+s._id]=c}});
    if(S.uid)want['directory/'+S.uid]={name:S.name||'Quản trị viên',code:'QTV',role:'admin',dept:'Quản trị'};
    const adm='directory/'+S.uid;
    let idx={};try{const d=await S.db.doc('mirrorIndex/all').get();idx=d.exists?(d.data().m||{}):{}}catch(e){mirBusy=false;return}
    const next={};let ch=false;
    for(const path of Object.keys(want)){const h=(path===adm?'A:':'')+hashStr(JSON.stringify(want[path]));next[path]=h;
      if(idx[path]!==h){ch=true;if(!await save('mir',()=>S.db.doc(path).set(want[path])))throw 0;await new Promise(r=>setTimeout(r,70))}}
    for(const path of Object.keys(idx)){if(want[path]||String(idx[path]).indexOf('A:')===0)continue;next[path]=undefined;delete next[path];ch=true;await save('mir',()=>S.db.doc(path).delete());await new Promise(r=>setTimeout(r,70))}
    Object.keys(idx).forEach(p=>{if(String(idx[p]).indexOf('A:')===0&&p!==adm)next[p]=idx[p]});
    if(ch)await save('mir',()=>S.db.doc('mirrorIndex/all').set({m:next,at:Date.now()}))
  }catch(e){}
  mirBusy=false}

/* ===== khởi động ===== */
async function boot(){
  render();
  const slow=setTimeout(()=>{if(!S.ready){S.slow=true;render()}},10000);
  if(!window.claude||!window.claude.use){S.fatal='Hãy mở trang này trong ứng dụng hoặc trình duyệt Claude để dùng hệ thống.';clearTimeout(slow);render();return}
  const r=await Promise.all([window.claude.use('db'),window.claude.use('user'),window.claude.use('mcp'),window.claude.use('downloads')]);
  const db=r[0];S.user=r[1];S.mcp=r[2];S.dl=r[3];
  if(!db){S.fatal='Chưa kết nối được máy chủ dữ liệu. Kiểm tra mạng rồi mở lại ứng dụng.';clearTimeout(slow);render();return}
  S.db=db;
  try{S.upl=await window.claude.use('assets')}catch(e){S.upl=null}
  if(S.user){const me=await S.user.me();S.uid=me.id;S.name=me.name||'';S.isAdmin=await S.user.canEdit()}
  S.page=S.isAdmin?'home':'me';
  const ready=()=>{if(!S.ready){S.ready=true;clearTimeout(slow)}},onErr=e=>{S.fatal=H.errMsg(e);render()};
  db.collection('holidays').onSnapshot(s=>{S.holidays={};s.docs.forEach(d=>{S.holidays[d.id]=d.data()});render()},onErr);
  db.doc('settings/general').onSnapshot(s=>{S.settings=Object.assign({sat:'half',company:'',address:'',sheetId:''},s.exists?s.data():{});render()},onErr);
  if(S.isAdmin){
    db.collection('staff').onSnapshot(s=>{S.staff=mapDocs(s);ready();render();schedMirror()},onErr);
    db.collection('claims').onSnapshot(s=>{S.claims=mapDocs(s);render();resolveNames(S.claims.map(c=>c._id))},onErr);
    db.collection('assets').onSnapshot(s=>{S.assets=mapDocs(s);render()},onErr);
    db.collection('locations').onSnapshot(s=>{S.locs=mapDocs(s);render()},onErr);
    db.collection('scans').onSnapshot(s=>{S.scans={};s.docs.forEach(d=>{S.scans[d.id]=d.data()});render()},onErr);
    db.collection('items').onSnapshot(s=>{S.items=mapDocs(s);render()},onErr);
    db.collection('stockTx').onSnapshot(s=>{S.tx=mapDocs(s);render()},onErr);
    db.collection('stocktakes').onSnapshot(s=>{S.stocktakes=mapDocs(s);render()},()=>{});
    db.collection('issueLog').onSnapshot(s=>{S.issues=mapDocs(s);syncSigns();render()},onErr);
    db.collection('audit').orderBy('at','desc').limit(200).onSnapshot(s=>{S.audit=mapDocs(s);if(S.page==='audit')render()},()=>{});
  }else if(S.uid){
    db.doc('staff/'+S.uid).onSnapshot(s=>{S.myDoc=s.exists?s.data():null;ready();
      if(S.myDoc&&S.myDoc.role==='manager'&&!S.subs.team){S.subs.team=1;db.collection('team/'+S.uid+'/m').onSnapshot(t=>{S.team=mapDocs(t);render()},()=>{})}
      render()},onErr);
    db.doc('claims/'+S.uid).onSnapshot(s=>{S.myClaim=s.exists?s.data():null;render()},onErr);
    db.collection('issues/'+S.uid+'/rec').onSnapshot(s=>{S.myIssues=mapDocs(s);render()},()=>{});
    db.collection('signs/'+S.uid+'/rec').onSnapshot(s=>{S.mySigns={};s.docs.forEach(d=>{S.mySigns[d.id]=d.data()});render()},()=>{});
  }else{ready();render()}
  if(S.uid){
    H.loadSeen();H.bseenLoad();
    db.collection('board').onSnapshot(s=>{S.board=mapDocs(s);if(S.form.bt)boardSync(S.form.bt);render()},()=>{});
    db.collection('directory').onSnapshot(s=>{S.dir={};s.docs.forEach(d=>{S.dir[d.id]=d.data()});render()},()=>{});
    db.collection('chatrooms').onSnapshot(s=>{S.rooms=mapDocs(s);H.chatSync();render()},()=>{});
    db.collection('dm/'+S.uid+'/m').orderBy('t','desc').limit(300).onSnapshot(s=>{S.dms=s.docs.map(d=>Object.assign({_k:'',_id:d.id},d.data())).map(m=>(m._k='d:'+m.peer,m));render()},()=>{});
    H.chatSync();
    if(H.pinCfg()){showLock();armIdle()}
  }
}
async function resolveNames(ids){
  if(!S.user||!ids.length)return;
  try{const ps=await S.user.profiles(ids);let ch=false;ids.forEach(id=>{const n=ps[id]&&ps[id].name;if(n&&S.names[id]!==n){S.names[id]=n;ch=true}const em=ps[id]&&ps[id].email;if(em&&S.emails[id]!==em){S.emails[id]=em;ch=true}});if(ch)render()}catch(e){}}
boot();
})();
</script>
