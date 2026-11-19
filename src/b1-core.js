(function(){
'use strict';
/* ===== tiện ích ===== */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ds=(y,m,d)=>y+'-'+pad(m)+'-'+pad(d);
const dim=(y,m)=>new Date(y,m,0).getDate();
const dow=(y,m,d)=>new Date(y,m-1,d).getDay();
const parse=s=>{const a=String(s).split('-').map(Number);return new Date(a[0],a[1]-1,a[2])};
const midnight=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const diffDays=(a,b)=>Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);
const todayStr=()=>{const t=new Date();return ds(t.getFullYear(),t.getMonth()+1,t.getDate())};
const fmt=s=>{if(!s)return '—';const a=String(s).split('-');return a.length===3?a[2]+'/'+a[1]+'/'+a[0]:s};
const fmtTs=t=>{if(!t)return '—';const d=new Date(t);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())};
const money=n=>n===''||n==null||isNaN(n)?'—':Number(n).toLocaleString('vi-VN');
const WD=['T2','T3','T4','T5','T6','T7','CN'];
const CONTRACTS=['Thử việc','Xác định thời hạn','Không xác định thời hạn','Thời vụ / dịch vụ'];
const KHO=['Kho kế toán','Kho HCNS','Kho vật tư sản xuất'];
const ICAT=['Văn phòng phẩm','Túi / bao bì','Giấy in','Bảo hộ lao động','Vật dụng sản xuất','Khác'];
const ACAT=['Máy tính / laptop','Thiết bị văn phòng','Nội thất','Máy móc sản xuất','Phương tiện','Khác'];
const CLASS={normal:['Điều kiện bình thường',12],minor:['Chưa thành niên / người khuyết tật',14],heavy:['Nặng nhọc, độc hại, nguy hiểm',14],special:['Đặc biệt nặng nhọc, độc hại, nguy hiểm',16]};
const CODES={X:'Làm cả ngày',N:'Làm nửa ngày',P:'Nghỉ phép năm',O:'Nghỉ ốm',K:'Nghỉ không lương',L:'Công lễ (tự động)',T:'Công tác ngoài nhà máy'};
const SHOW={X:'X',N:'½',P:'P',O:'O',K:'K',L:'L',T:'T','':''};
const pill=(k,t)=>'<span class="pill '+k+'">'+esc(t)+'</span>';
const initials=n=>{const p=String(n||'?').trim().split(/\s+/);return (p[p.length-1][0]||'?').toUpperCase()};
const byCode=(a,b)=>String(a.code).localeCompare(String(b.code),'vi',{numeric:true});
const validCode=c=>/^[A-Z0-9_-]{2,30}$/.test(c);
const uid8=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const norm=s=>String(s==null?'':s).toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');

const now=new Date();
const S={db:null,user:null,mcp:null,dl:null,uid:null,name:'',isAdmin:false,ready:false,slow:false,fatal:'',
  page:'home',navOpen:false,form:{},confirm:'',
  staff:[],claims:[],holidays:{},settings:{sat:'half',company:'',address:'',sheetId:''},names:{},emails:{},upl:null,myDoc:null,myClaim:null,
  assets:[],scans:{},locs:[],items:[],tx:[],issues:[],signs:{},myIssues:[],mySigns:{},
  month:{y:now.getFullYear(),m:now.getMonth()+1},year:now.getFullYear(),brush:'X',attEmp:null,attMode:'matrix',
  imp:null,scan:{loc:'',res:null,hist:[]},busy:'',scanSubs:false,
  stocktakes:[],board:[],bmsgs:{},bimg:{},bseen:{},bbase:0,dir:{},rooms:[],msgs:{},dms:[],team:[],audit:[],chat:{room:'',open:false,emo:false,limit:60,seen:{}},spin:0,lock:false,anim:false,subs:{}};
const role=()=>S.isAdmin?'admin':(S.myDoc&&S.myDoc.role==='manager'?'manager':'employee');
const audit=(act,detail)=>{if(!S.isAdmin||!S.db)return;const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);return enqueue('audit',()=>S.db.doc('audit/'+id).set({at:Date.now(),by:S.uid||'',byName:S.name||'',act:act,detail:String(detail||'').slice(0,200)})).catch(()=>{})};
const actCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let o='';const r=crypto.getRandomValues(new Uint8Array(10));for(let i=0;i<10;i++){o+=a[r[i]%a.length];if(i===4)o+='-'}return o};
const nameDir=id=>(S.dir[id]&&S.dir[id].name)||(id&&id===S.uid&&S.name)||S.names[id]||'Tài khoản';

/* ===== ghi dữ liệu theo hàng đợi ===== */
const queues=new Map();
function enqueue(key,fn){const p=(queues.get(key)||Promise.resolve()).catch(()=>{}).then(fn);queues.set(key,p);return p}
function errMsg(e){const c=e&&e.code;
  if(c==='invalid_argument')return 'Không ghi được: tài khoản này chưa có quyền hoặc dữ liệu chưa hợp lệ.';
  if(c==='quota_exceeded')return 'Kho lưu trữ đã đầy.';
  if(c==='resource_exhausted')return 'Thao tác quá nhanh, thử lại sau giây lát.';
  if(c==='revoked')return 'Quyền truy cập của bạn đã bị thu hồi.';
  return 'Chưa lưu được, hãy thử lại.'}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),3600)}
async function save(key,fn,okMsg){
  for(let i=0;i<3;i++){
    try{await enqueue(key,fn);if(okMsg)toast(okMsg);return true}
    catch(e){if(e&&e.code==='resource_exhausted'&&i<2){await new Promise(r=>setTimeout(r,900*(i+1)));continue}toast(errMsg(e));return false}
  }return false}

/* ===== quy tắc công, phép, hợp đồng ===== */
function dayInfo(y,m,d){const s=ds(y,m,d),w=dow(y,m,d);
  return {s:s,w:w,hol:S.holidays[s]||null,off:w===0||(w===6&&S.settings.sat==='off'),half:w===6&&S.settings.sat==='half'}}
function effCode(st,info){const rec=st&&st.att&&st.att[info.s];if(rec)return rec;return info.hol&&!info.off?'L':''}
/* Hệ số lương tăng ca theo Bộ luật Lao động 2019 (Điều 98): 150% ngày thường, 200% ngày nghỉ hằng tuần, 300% ngày lễ; làm đêm cộng 30% và phụ cấp 20% tiền lương ngày thường */
const otRate=(info,o)=>(info.hol?300:info.off?200:150)+(o&&o.n?50:0);
const otDayKind=info=>info.hol?'Ngày lễ':info.off?'Ngày nghỉ hằng tuần':'Ngày thường';
function otYear(st,y){let h=0;Object.keys(st.ot||{}).forEach(k=>{if(k.indexOf(y+'-')===0)h+=Number(st.ot[k].h)||0});return Math.round(h*100)/100}
function summarize(st,y,m){const r={std:0,x:0,n:0,p:0,o:0,k:0,l:0,t:0,ot:0,otEq:0};
  for(let d=1;d<=dim(y,m);d++){const i=dayInfo(y,m,d);
    if(!i.off&&!i.hol)r.std+=i.half?.5:1;
    const c=effCode(st,i);if(c==='X')r.x++;else if(c==='N')r.n++;else if(c==='P')r.p++;else if(c==='O')r.o++;else if(c==='K')r.k++;else if(c==='L')r.l++;else if(c==='T')r.t++;
    const ov=st&&st.ot&&st.ot[i.s];if(ov&&Number(ov.h)>0){const h=Number(ov.h);r.ot+=h;r.otEq+=h*otRate(i,ov)/100}}
  r.ot=Math.round(r.ot*100)/100;r.otEq=Math.round(r.otEq*100)/100;
  r.paid=r.x+r.n*.5+r.p+r.l+r.t;return r}
/* Định mức phép theo Bộ luật Lao động 2019 (Điều 113, 114): 12/14/16 ngày, cộng 1 ngày cho mỗi 5 năm làm việc, tính theo tháng nếu chưa đủ 12 tháng */
function leaveInfo(st,year){
  const base=(CLASS[st.jobClass]||CLASS.normal)[1];let years=0,months=12;
  if(st.startDate){const s=parse(st.startDate);
    years=Math.max(0,Math.floor((new Date(year,11,31)-s)/(365.25*864e5)));
    if(s.getFullYear()>year)months=0;
    else if(s.getFullYear()===year)months=Math.max(0,12-s.getMonth()-(s.getDate()>15?1:0))}
  const bonus=Math.floor(years/5),extra=Number(st.leaveExtra)||0;
  const quota=Math.round((base+bonus)*months/12*2)/2+extra;
  const att=st.att||{},dates=[];let sick=0,unpaid=0;
  Object.keys(att).forEach(k=>{if(k.indexOf(year+'-')!==0)return;const c=att[k];if(c==='P')dates.push(k);else if(c==='O')sick++;else if(c==='K')unpaid++});
  dates.sort();let runs=0,prev=null;
  dates.forEach(k=>{const d=parse(k);if(!prev||diffDays(prev,d)>1)runs++;prev=d});
  return {base:base,bonus:bonus,years:years,months:months,extra:extra,quota:quota,used:dates.length,runs:runs,sick:sick,unpaid:unpaid,left:quota-dates.length}}
function contractState(st){
  if(/không xác định/i.test(st.contractType||''))return{k:'ok',t:'Không thời hạn',d:99999};
  if(!st.contractEnd)return{k:'none',t:'Chưa có ngày hết hạn',d:99998};
  const d=diffDays(midnight(new Date()),parse(st.contractEnd));
  if(d<0)return{k:'bad',t:'Quá hạn '+(-d)+' ngày',d:d};
  if(d===0)return{k:'bad',t:'Hết hạn hôm nay',d:d};
  if(d<=30)return{k:'warn',t:'Còn '+d+' ngày',d:d};
  if(d<=60)return{k:'note',t:'Còn '+d+' ngày',d:d};
  return{k:'ok',t:'Còn '+d+' ngày',d:d}}
function upcomingHolidays(limit){const t=todayStr();
  return Object.keys(S.holidays).filter(k=>k>=t).sort().slice(0,limit).map(k=>({date:k,name:S.holidays[k].name,days:diffDays(midnight(new Date()),parse(k))}))}
const nameOf=id=>S.names[id]||'Tài khoản chưa rõ tên';

/* ===== tài sản, kho ===== */
const locName=c=>{const l=S.locs.find(x=>x._id===c);return l?l.name+' ('+c+')':(c||'—')};
function assetState(a){
  if(!a.expectedLoc)return{k:'none',t:'Chưa gán vị trí chuẩn'};
  const sc=S.scans[a._id];if(!sc)return{k:'warn',t:'Chưa quét'};
  return sc.loc===a.expectedLoc?{k:'ok',t:'Đúng chỗ'}:{k:'bad',t:'Sai chỗ'}}
function stockMap(){const m={};S.tx.forEach(t=>{if(t.void)return;const q=Number(t.qty)||0;m[t.item]=(m[t.item]||0)+(t.type==='out'?-q:q)});return m}
function issSigned(i){return i.status==='signed'||!!(S.signs[i.empUid]&&S.signs[i.empUid][i._id])}
function issSig(i){return i.sig||(S.signs[i.empUid]&&S.signs[i.empUid][i._id]&&S.signs[i.empUid][i._id].sig)||''}

/* ===== ảnh, mã QR, chữ ký ===== */
function cropPhoto(file,size){return new Promise((res,rej)=>{const img=new Image(),u=URL.createObjectURL(file);
  img.onload=()=>{const s=Math.min(img.width,img.height),c=document.createElement('canvas');c.width=c.height=size;
    c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,size,size);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.82))};
  img.onerror=()=>{URL.revokeObjectURL(u);rej()};img.src=u})}
function decodeQR(file){return new Promise((res,rej)=>{const img=new Image(),u=URL.createObjectURL(file);
  img.onload=()=>{const sc=Math.min(1,1100/Math.max(img.width,img.height)),c=document.createElement('canvas');
    c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
    if(!window.jsQR){rej('nolib');return}
    const d=x.getImageData(0,0,c.width,c.height),r=window.jsQR(d.data,d.width,d.height,{inversionAttempts:'attemptBoth'});res(r?r.data:null)};
  img.onerror=()=>{URL.revokeObjectURL(u);rej('img')};img.src=u})}
function drawQR(ctx,text,x,y,size){
  if(!window.qrcode){ctx.fillStyle='#fff';ctx.fillRect(x,y,size,size);ctx.fillStyle='#000';ctx.font='12px sans-serif';ctx.fillText('Thiếu thư viện QR',x+6,y+size/2);return}
  const qr=window.qrcode(0,'M');qr.addData(text);qr.make();const n=qr.getModuleCount(),q=2,cell=size/(n+q*2);
  ctx.fillStyle='#fff';ctx.fillRect(x,y,size,size);ctx.fillStyle='#000';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))ctx.fillRect(x+(c+q)*cell,y+(r+q)*cell,Math.ceil(cell),Math.ceil(cell))}
function labelSheet(items,cols){
  const W=300,H=360,rows=Math.ceil(items.length/cols),cv=document.createElement('canvas');cv.width=W*cols;cv.height=H*rows;
  const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);
  items.forEach((it,i)=>{const cx=(i%cols)*W,cy=Math.floor(i/cols)*H;
    x.strokeStyle='#999';x.setLineDash([4,4]);x.strokeRect(cx+6,cy+6,W-12,H-12);x.setLineDash([]);
    drawQR(x,it.text,cx+30,cy+20,240);x.fillStyle='#000';x.textAlign='center';
    x.font='bold 22px sans-serif';x.fillText(it.code,cx+W/2,cy+288);
    x.font='15px sans-serif';let t=it.name||'';if(t.length>32)t=t.slice(0,31)+'…';x.fillText(t,cx+W/2,cy+312);
    x.fillStyle='#444';x.font='13px sans-serif';let s=it.sub||'';if(s.length>38)s=s.slice(0,37)+'…';x.fillText(s,cx+W/2,cy+334)});
  return cv}
function canvasBlob(cv){return new Promise(r=>cv.toBlob(r,'image/png'))}
function attachSig(cv){
  const x=cv.getContext('2d');cv.width=480;cv.height=180;x.fillStyle='#fff';x.fillRect(0,0,480,180);
  x.lineWidth=3;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#10243a';
  let down=false,has=false,last=null;
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]};
  cv.addEventListener('pointerdown',e=>{down=true;last=pos(e);try{cv.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
  cv.addEventListener('pointermove',e=>{if(!down)return;const p=pos(e);x.beginPath();x.moveTo(last[0],last[1]);x.lineTo(p[0],p[1]);x.stroke();last=p;has=true;e.preventDefault()});
  const up=()=>{down=false};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  return {clear(){x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);has=false},isEmpty(){return !has},data(){return cv.toDataURL('image/png')}}}

window.__HR={otRate:otRate,otDayKind:otDayKind,otYear:otYear,role:role,audit:audit,actCode:actCode,nameDir:nameDir,$:$,esc:esc,pad:pad,ds:ds,dim:dim,dow:dow,parse:parse,midnight:midnight,diffDays:diffDays,todayStr:todayStr,fmt:fmt,fmtTs:fmtTs,money:money,WD:WD,CONTRACTS:CONTRACTS,KHO:KHO,ICAT:ICAT,ACAT:ACAT,CLASS:CLASS,CODES:CODES,SHOW:SHOW,pill:pill,initials:initials,byCode:byCode,validCode:validCode,uid8:uid8,norm:norm,S:S,enqueue:enqueue,errMsg:errMsg,toast:toast,save:save,dayInfo:dayInfo,effCode:effCode,summarize:summarize,leaveInfo:leaveInfo,contractState:contractState,upcomingHolidays:upcomingHolidays,nameOf:nameOf,locName:locName,assetState:assetState,stockMap:stockMap,issSigned:issSigned,issSig:issSig,cropPhoto:cropPhoto,decodeQR:decodeQR,drawQR:drawQR,labelSheet:labelSheet,canvasBlob:canvasBlob,attachSig:attachSig};
})();
