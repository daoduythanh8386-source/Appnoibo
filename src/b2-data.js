(function(){
'use strict';
const H=window.__HR,S=H.S,esc=H.esc,norm=H.norm,fmt=H.fmt,pad=H.pad,toast=H.toast;

/* ===== cấu hình dữ liệu nhập / xuất ===== */
const A=(...a)=>a;
const ENT={
 staff:{label:'Nhân viên',tab:'NhanVien',cols:[
  A('code','Mã nhân viên',['manhanvien','manv','ma','code','msnv']),
  A('name','Họ và tên',['hovaten','hoten','ten','name']),
  A('dept','Phòng ban',['phongban','bophan','dept']),
  A('title','Chức danh',['chucdanh','chucvu','vitri']),
  A('hometown','Quê quán',['quequan','noisinh','diachi']),
  A('email','Email cá nhân',['emailcanhan','email','mail']),
  A('phone','Số điện thoại',['sodienthoai','sdt','dienthoai','phone']),
  A('startDate','Ngày vào làm',['ngayvaolam','ngayvao','ngaybatdau'],'date'),
  A('contractType','Loại hợp đồng',['loaihopdong','loaihd','hopdong'],'ctype'),
  A('contractNo','Số hợp đồng',['sohopdong','sohd']),
  A('contractStart','Hợp đồng từ ngày',['hopdongtungay','hopdongtu','ngayhieuluc','tungay'],'date'),
  A('contractEnd','Hợp đồng đến ngày',['hopdongdenngay','hopdongden','ngayhethan','hethan','denngay'],'date'),
  A('jobClass','Nhóm công việc',['nhomcongviec','dieukienlaodong'],'jclass'),
  A('leaveExtra','Điều chỉnh phép (+/- ngày)',['dieuchinhphep','phepcong'],'num')]},
 assets:{label:'Tài sản',tab:'TaiSan',cols:[
  A('code','Mã tài sản',['mataisan','mats','ma','code']),
  A('name','Tên tài sản',['tentaisan','ten','name']),
  A('cat','Loại tài sản',['loaitaisan','loai','nhom']),
  A('serial','Số serial',['soserial','serial','somay']),
  A('buyDate','Ngày mua',['ngaymua'],'date'),
  A('value','Nguyên giá',['nguyengia','giatri','gia'],'num'),
  A('holder','Người đang giữ',['nguoidanggiu','nguoigiu','nguoisudung','baoquan']),
  A('expectedLoc','Mã vị trí chuẩn',['mavitrichuan','vitrichuan','mavitri']),
  A('state','Tình trạng',['tinhtrang','trangthai']),
  A('note','Ghi chú',['ghichu','note'])]},
 items:{label:'Vật tư',tab:'VatTu',cols:[
  A('code','Mã vật tư',['mavattu','mavt','ma','code']),
  A('name','Tên vật tư',['tenvattu','ten','name']),
  A('cat','Nhóm vật tư',['nhomvattu','nhom','loai']),
  A('unit','Đơn vị tính',['donvitinh','dvt','donvi']),
  A('kho','Kho',['kho','tenkho'],'kho'),
  A('min','Tồn tối thiểu',['tontoithieu','toithieu','min'],'num')]},
 locs:{label:'Vị trí',tab:'ViTri',cols:[
  A('code','Mã vị trí',['mavitri','ma','code']),
  A('name','Tên vị trí',['tenvitri','ten','name']),
  A('note','Ghi chú',['ghichu','note'])]}
};
H.ENT=ENT;
const dataOf=k=>k==='staff'?S.staff:k==='assets'?S.assets:k==='items'?S.items:S.locs;
H.dataOf=dataOf;

function toISO(v){
  if(v==null||v==='')return '';
  if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Math.round((v-25569)*864e5));return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())}
  const s=String(v).trim();let m;
  if((m=/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(s)))return m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);
  if((m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s)))return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);
  return ''}
function toNum(v){if(typeof v==='number')return v;let s=String(v==null?'':v).replace(/\s/g,'').replace(/[^\d.,-]/g,'');if(!s)return '';
  if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'.');
  const n=parseFloat(s);return isNaN(n)?'':n}
function cell(c,v){
  const t=c[3];if(v==null)return '';
  if(t==='date')return toISO(v);if(t==='num')return toNum(v);
  const s=String(v).trim();if(!s)return '';const n=norm(s);
  if(t==='ctype'){if(n.indexOf('khongxacdinh')>=0)return 'Không xác định thời hạn';if(n.indexOf('thuviec')>=0)return 'Thử việc';if(n.indexOf('thoivu')>=0||n.indexOf('dichvu')>=0)return 'Thời vụ / dịch vụ';return 'Xác định thời hạn'}
  if(t==='jclass'){if(n.indexOf('dacbiet')>=0)return 'special';if(n.indexOf('nangnhoc')>=0||n.indexOf('doc')>=0||n.indexOf('nguyhiem')>=0)return 'heavy';if(n.indexOf('thanhnien')>=0||n.indexOf('khuyettat')>=0)return 'minor';return 'normal'}
  if(t==='kho'){if(n.indexOf('ketoan')>=0)return 'Kho kế toán';if(n.indexOf('sanxuat')>=0)return 'Kho vật tư sản xuất';return 'Kho HCNS'}
  return s}

/* parse văn bản thô: tab, chấm phẩy hoặc dấu phẩy, hỗ trợ ô trong ngoặc kép */
function parseDelimited(text){
  const first=(text.split(/\r?\n/)[0]||'');
  const cnt={'\t':(first.match(/\t/g)||[]).length,';':(first.match(/;/g)||[]).length,',':(first.match(/,/g)||[]).length};
  const d=cnt['\t']>=cnt[';']&&cnt['\t']>=cnt[',']&&cnt['\t']>0?'\t':(cnt[';']>cnt[','])?';':',';
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=ch}
    else if(ch==='"')q=true;else if(ch===d){row.push(f);f=''}
    else if(ch==='\n'){row.push(f);rows.push(row);row=[];f=''}else if(ch!=='\r')f+=ch}
  if(f!==''||row.length){row.push(f);rows.push(row)}
  return rows}
H.parseDelimited=parseDelimited;

function mapRecords(ek,rows){
  const E=ENT[ek];if(!rows||!rows.length)return{recs:[],unmapped:[],errors:['Không có dữ liệu.'],mapped:[]};
  const idx={},unmapped=[],mapped=[];
  rows[0].forEach((h,i)=>{const n=norm(h);if(!n)return;let f=null;
    for(const c of E.cols){if(c[2].indexOf(n)>=0||norm(c[1])===n){f=c;break}}
    if(f&&!(f[0] in idx)){idx[f[0]]=i;mapped.push(f[1])}else unmapped.push(String(h))});
  const recs=[],errors=[];
  if(!('code' in idx))return{recs:[],unmapped:unmapped,errors:['Không tìm thấy cột mã ('+E.cols[0][1]+'). Hàng đầu tiên phải là tiêu đề cột.'],mapped:mapped};
  for(let r=1;r<rows.length;r++){const row=rows[r];
    if(!row||row.every(v=>String(v==null?'':v).trim()===''))continue;
    const rec={};
    E.cols.forEach(c=>{if(!(c[0] in idx))return;const v=cell(c,row[idx[c[0]]]);if(v!==''&&v!=null)rec[c[0]]=v});
    rec.code=String(rec.code||'').toUpperCase().replace(/\s+/g,'');
    if(!H.validCode(rec.code)){errors.push('Dòng '+(r+1)+': mã "'+rec.code+'" không hợp lệ (2 đến 30 ký tự chữ, số, - hoặc _).');continue}
    recs.push(rec)}
  return{recs:recs,unmapped:unmapped,errors:errors,mapped:mapped}}
H.mapRecords=mapRecords;

function entCell(ek,c,r){
  const v=r[c[0]];if(v==null||v==='')return '';const t=c[3];
  if(t==='date')return fmt(v);
  if(t==='jclass')return (H.CLASS[v]||H.CLASS.normal)[0];
  return v}
function entAoa(ek,withData){
  const E=ENT[ek],head=E.cols.map(c=>c[1]);
  if(!withData){
    const ex={staff:['NV001','Nguyễn Văn A','Sản xuất','Công nhân','Thanh Hóa','a@gmail.com','0900000000','01/03/2024','Xác định thời hạn','HD-001','01/03/2024','28/02/2026','Bình thường','0'],
      assets:['TS001','Máy tính Dell','Máy tính / laptop','SN12345','15/01/2025','15000000','Nguyễn Văn A','VP-01','Đang dùng',''],
      items:['VT001','Găng tay bảo hộ','Bảo hộ lao động','Đôi','Kho HCNS','50'],locs:['VP-01','Phòng kế toán','Tầng 2']}[ek];
    return [head,ex]}
  return [head].concat(dataOf(ek).slice().sort(H.byCode).map(r=>E.cols.map(c=>entCell(ek,c,r))))}
H.entAoa=entAoa;

/* ===== tải xuống Excel / CSV ===== */
async function exportAoa(name,aoa,widths,merges){
  if(!S.dl){toast('Môi trường này chưa hỗ trợ tải xuống.');return false}
  try{
    if(window.XLSX){const ws=XLSX.utils.aoa_to_sheet(aoa);if(widths)ws['!cols']=widths.map(w=>({wch:w}));if(merges)ws['!merges']=merges;
      const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Bao cao');
      await S.dl.save({filename:name+'.xlsx',data:XLSX.write(wb,{type:'array',bookType:'xlsx'})})}
    else{const csv='﻿'+aoa.map(r=>r.map(v=>{const s=String(v==null?'':v);return /[",\n;]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}).join(',')).join('\r\n');
      await S.dl.save({filename:name+'.csv',data:csv})}
    toast('Đã lưu tệp '+name);return true
  }catch(e){if(e&&e.code==='declined')return false;toast('Không tải xuống được ('+((e&&e.code)||'lỗi')+').');return false}}
H.exportAoa=exportAoa;

/* ===== Google Sheets qua kết nối của người xem ===== */
const GS='Google Sheets';
function sheetId(){const v=String(S.settings.sheetId||'').trim(),m=/\/d\/([A-Za-z0-9_-]+)/.exec(v);return m?m[1]:v}
H.sheetId=sheetId;
function gErr(e){const c=e&&e.code;
  if(c==='server_not_connected'||c==='server_not_found')return 'Chưa kết nối Google Sheets. Thêm kết nối Google Sheets trong Cài đặt, mục Connectors của claude.ai.';
  if(c==='needs_reauth')return 'Phiên Google Sheets đã hết hạn. Kết nối lại trong Cài đặt, mục Connectors.';
  if(c==='not_in_manifest')return 'Bạn chưa cho phép trang này dùng Google Sheets.';
  if(c==='approval_required'||c==='consent_required')return 'Cần bạn cho phép trang này dùng Google Sheets rồi bấm lại.';
  if(c==='blocked_by_policy')return 'Tổ chức của bạn chặn công cụ Google Sheets này.';
  if(c==='selection_required')return 'Bạn có nhiều kết nối Google Sheets. Hãy chọn một kết nối khi được hỏi.';
  if(c==='tool_error'){const m=String(e.message||'').slice(0,160);return 'Google Sheets báo lỗi: '+(m||'kiểm tra tên trang tính và quyền truy cập tệp.')}
  if(c==='capability_disabled'||c==='not_granted')return 'Chế độ xem hiện tại chưa hỗ trợ Google Sheets. Mở trang trong ứng dụng Claude.';
  return 'Chưa gọi được Google Sheets, thử lại sau.'}
H.gErr=gErr;
function gCall(tool,input){if(!S.mcp)return Promise.reject({code:'capability_disabled'});return S.mcp.callTool(GS,tool,input,{cache:false})}
function rowsOf(p){
  if(typeof p==='string'){try{p=JSON.parse(p)}catch(e){return []}}
  if(Array.isArray(p))return p;
  if(p&&Array.isArray(p.values))return p.values;
  if(p&&p.valueRange&&Array.isArray(p.valueRange.values))return p.valueRange.values;
  return []}
async function gsPull(tab){
  const id=sheetId();if(!id)throw {code:'tool_error',message:'Chưa nhập liên kết Google Sheets.'};
  const r=await gCall('get_values',{spreadsheetId:id,range:tab+'!A1:AD3000'});
  return rowsOf(r.payload).map(row=>row.map(v=>v==null?'':v))}
async function gsPush(tab,aoa){
  const id=sheetId();if(!id)throw {code:'tool_error',message:'Chưa nhập liên kết Google Sheets.'};
  const vals=aoa.map(r=>r.map(v=>v==null?'':(typeof v==='number'||typeof v==='boolean')?v:String(v)));
  await gCall('batch_clear_values',{spreadsheetId:id,ranges:[tab+'!A1:AD3000']});
  await gCall('update_values',{spreadsheetId:id,range:tab+'!A1',values:vals})}
async function gsTabs(){
  const id=sheetId();if(!id)throw {code:'tool_error',message:'Chưa nhập liên kết Google Sheets.'};
  const r=await gCall('get_spreadsheet',{spreadsheetId:id,fields:['properties.title','sheets.properties.title']});
  let p=r.payload;if(typeof p==='string'){try{p=JSON.parse(p)}catch(e){p={}}}
  return{title:(p&&p.properties&&p.properties.title)||'',tabs:((p&&p.sheets)||[]).map(s=>s.properties&&s.properties.title).filter(Boolean)}}
H.gsPull=gsPull;H.gsPush=gsPush;H.gsTabs=gsTabs;

/* ===== báo cáo ===== */
function sheetAoa(title,period,heads,rows,ncols){
  const d=new Date(),a=[[S.settings.company||'(Tên đơn vị)'],['Địa chỉ: '+(S.settings.address||'')],[],[title.toUpperCase()],[period],[]];
  heads.forEach(h=>a.push(h));rows.forEach(r=>a.push(r));
  a.push([]);const sg=[];for(let i=0;i<ncols;i++)sg.push('');
  const dl=sg.slice();dl[Math.max(0,ncols-3)]='Ngày '+d.getDate()+' tháng '+(d.getMonth()+1)+' năm '+d.getFullYear();a.push(dl);
  const p=Math.max(1,Math.floor(ncols/3)),r1=sg.slice();r1[0]='Người lập biểu';r1[p]='Kế toán trưởng / Trưởng phòng HCNS';r1[Math.min(ncols-1,2*p)]='Giám đốc';a.push(r1);
  const r2=sg.slice();r2[0]='(Ký, ghi rõ họ tên)';r2[p]='(Ký, ghi rõ họ tên)';r2[Math.min(ncols-1,2*p)]='(Ký, đóng dấu)';a.push(r2);
  const merges=[3,4].map(r=>({s:{r:r,c:0},e:{r:r,c:Math.max(0,ncols-1)}}));
  return{aoa:a,merges:merges}}
const actStaff=()=>S.staff.filter(s=>s.status!=='left').sort(H.byCode);
const mLabel=()=>'Tháng '+S.month.m+'/'+S.month.y;
const REP=[
 {id:'staff',label:'Danh sách nhân sự',tab:'BC_NhanSu',desc:'Hồ sơ, quê quán, email, hợp đồng và số ngày còn lại.',build(){
  const head=['STT','Mã NV','Họ và tên','Phòng ban','Chức danh','Quê quán','Email cá nhân','Số điện thoại','Ngày vào làm','Loại hợp đồng','Số hợp đồng','Hợp đồng từ','Hợp đồng đến','Còn lại (ngày)','Trạng thái'];
  const rows=S.staff.slice().sort(H.byCode).map((s,i)=>{const c=H.contractState(s);return[i+1,s.code,s.name,s.dept||'',s.title||'',s.hometown||'',s.email||'',s.phone||'',fmt(s.startDate),s.contractType||'',s.contractNo||'',fmt(s.contractStart),fmt(s.contractEnd),c.d<90000?c.d:'',s.status==='left'?'Đã nghỉ việc':'Đang làm việc']});
  const r=sheetAoa('Danh sách nhân sự','Tính đến ngày '+fmt(H.todayStr()),[head],rows,head.length);
  return{name:'danh-sach-nhan-su',aoa:r.aoa,merges:r.merges,widths:[5,10,24,16,16,16,26,14,12,20,14,12,12,10,14]}}},
 {id:'att',label:'Bảng chấm công tháng',tab:'BC_ChamCong',desc:'Theo bố cục bảng chấm công, đủ ngày trong tháng và tổng công.',build(){
  const y=S.month.y,m=S.month.m,n=H.dim(y,m),h1=['STT','Họ và tên','Mã NV'],h2=['','',''];
  for(let d=1;d<=n;d++){h1.push(d);h2.push(H.WD[(H.dow(y,m,d)+6)%7])}
  ['Công hưởng lương','Nghỉ phép','Nghỉ ốm','Không lương','Công tác ngoài','Tăng ca (giờ)','Giờ quy đổi','Công chuẩn'].forEach(t=>{h1.push(t);h2.push('')});
  const rows=actStaff().map((s,i)=>{const r=[i+1,s.name,s.code];
    for(let d=1;d<=n;d++){const c=H.effCode(s,H.dayInfo(y,m,d));r.push(c==='N'?'1/2':c)}
    const t=H.summarize(s,y,m);r.push(t.paid,t.p,t.o,t.k,t.t,t.ot,t.otEq,t.std);return r});
  const r=sheetAoa('Bảng chấm công',mLabel()+'. Ký hiệu: X làm cả ngày, 1/2 nửa ngày, P nghỉ phép, O nghỉ ốm, K nghỉ không lương, L công lễ, T công tác ngoài nhà máy (tính như làm cả ngày)',[h1,h2],rows,h1.length);
  return{name:'bang-cham-cong-'+y+'-'+pad(m),aoa:r.aoa,merges:r.merges,widths:[5,24,10].concat(Array(n).fill(4),[10,8,8,10,11,10,10,10])}}},
 {id:'ot',label:'Bảng tăng ca, làm thêm giờ',tab:'BC_TangCa',desc:'Chi tiết từng ngày tăng ca, hệ số 150/200/300% và giờ quy đổi, cảnh báo vượt 40 giờ/tháng.',build(){
  const y=S.month.y,m=S.month.m,n=H.dim(y,m),head=['STT','Mã NV','Họ và tên','Ngày','Loại ngày','Số giờ','Ca đêm','Hệ số (%)','Giờ quy đổi','Nội dung','Công tác ngoài (nơi làm việc)'],rows=[];let tot=0,eq=0,k=0;
  actStaff().forEach(s=>{let sh=0,se=0;
    for(let d=1;d<=n;d++){const i=H.dayInfo(y,m,d),o=s.ot&&s.ot[i.s],out=s.out&&s.out[i.s];
      if(o&&Number(o.h)>0){const h=Number(o.h),rt=H.otRate(i,o),q=Math.round(h*rt)/100;sh+=h;se+=q;rows.push([++k,s.code,s.name,fmt(i.s),H.otDayKind(i),h,o.n?'Có':'',rt,q,o.note||'',out?out.place||'':''])}}
    if(sh){tot+=sh;eq+=se;rows.push(['','','Cộng '+s.name+(sh>40?' (VƯỢT 40 GIỜ/THÁNG)':''),'','',sh,'','',Math.round(se*100)/100,'',''])}});
  rows.push(['','','TỔNG CỘNG','','',Math.round(tot*100)/100,'','',Math.round(eq*100)/100,'','']);
  const r=sheetAoa('Bảng tăng ca, làm thêm giờ',mLabel()+'. Hệ số: 150% ngày thường, 200% ngày nghỉ hằng tuần, 300% ngày lễ, làm đêm cộng 50%',[head],rows,head.length);
  return{name:'bang-tang-ca-'+y+'-'+pad(m),aoa:r.aoa,merges:r.merges,widths:[5,10,24,12,18,8,8,10,12,30,28]}}},
 {id:'leave',label:'Báo cáo nghỉ phép năm',tab:'BC_NghiPhep',desc:'Định mức theo Bộ luật Lao động, đã dùng, số đợt nghỉ, còn lại.',build(){
  const y=S.year,head=['STT','Mã NV','Họ và tên','Ngày vào làm','Thâm niên (năm)','Định mức gốc','Cộng thâm niên','Điều chỉnh','Tổng định mức','Đã nghỉ phép (ngày)','Số đợt nghỉ','Nghỉ ốm (ngày)','Không lương (ngày)','Phép còn lại'];
  const rows=actStaff().map((s,i)=>{const l=H.leaveInfo(s,y);return[i+1,s.code,s.name,fmt(s.startDate),l.years,l.base,l.bonus,l.extra,l.quota,l.used,l.runs,l.sick,l.unpaid,l.left]});
  const r=sheetAoa('Báo cáo nghỉ phép năm','Năm '+y,[head],rows,head.length);
  return{name:'nghi-phep-nam-'+y,aoa:r.aoa,merges:r.merges,widths:[5,10,24,12,10,10,10,10,10,12,10,10,12,10]}}},
 {id:'contract',label:'Hợp đồng đến hạn',tab:'BC_HopDong',desc:'Hợp đồng còn dưới 90 ngày hoặc đã quá hạn, xếp theo mức khẩn.',build(){
  const head=['STT','Mã NV','Họ và tên','Phòng ban','Loại hợp đồng','Số hợp đồng','Hợp đồng từ','Hợp đồng đến','Còn lại (ngày)','Tình trạng'];
  const rows=actStaff().map(s=>({s:s,c:H.contractState(s)})).filter(x=>x.c.d<=90).sort((a,b)=>a.c.d-b.c.d).map((x,i)=>[i+1,x.s.code,x.s.name,x.s.dept||'',x.s.contractType||'',x.s.contractNo||'',fmt(x.s.contractStart),fmt(x.s.contractEnd),x.c.d,x.c.t]);
  const r=sheetAoa('Danh sách hợp đồng lao động đến hạn','Tính đến ngày '+fmt(H.todayStr()),[head],rows,head.length);
  return{name:'hop-dong-den-han',aoa:r.aoa,merges:r.merges,widths:[5,10,24,16,20,14,12,12,12,18]}}},
 {id:'assets',label:'Danh mục và kiểm kê tài sản',tab:'BC_TaiSan',desc:'Nguyên giá, người giữ, vị trí chuẩn, vị trí quét gần nhất, đúng hay sai chỗ.',build(){
  const head=['STT','Mã tài sản','Tên tài sản','Loại','Số serial','Ngày mua','Nguyên giá','Người giữ','Vị trí chuẩn','Vị trí quét gần nhất','Ngày quét','Tình trạng vị trí'];
  const rows=S.assets.slice().sort(H.byCode).map((a,i)=>{const sc=S.scans[a._id];return[i+1,a.code,a.name,a.cat||'',a.serial||'',fmt(a.buyDate),a.value===''||a.value==null?'':a.value,a.holder||'',a.expectedLoc?H.locName(a.expectedLoc):'',sc?H.locName(sc.loc):'',sc?H.fmtTs(sc.at):'',H.assetState(a).t]});
  const r=sheetAoa('Danh mục và kiểm kê tài sản','Tính đến ngày '+fmt(H.todayStr()),[head],rows,head.length);
  return{name:'kiem-ke-tai-san',aoa:r.aoa,merges:r.merges,widths:[5,12,26,18,14,12,14,18,22,22,16,18]}}},
 {id:'nxt',label:'Báo cáo nhập, xuất, tồn kho',tab:'BC_NhapXuatTon',desc:'Tồn đầu kỳ, nhập, xuất, tồn cuối kỳ theo từng kho cho tháng đang chọn.',build(){
  const y=S.month.y,m=S.month.m,a=y+'-'+pad(m)+'-01',b=y+'-'+pad(m)+'-'+pad(H.dim(y,m));
  const head=['STT','Kho','Mã vật tư','Tên vật tư','ĐVT','Tồn đầu kỳ','Nhập trong kỳ','Xuất trong kỳ','Tồn cuối kỳ','Tồn tối thiểu'];
  const rows=S.items.slice().sort((p,q)=>String(p.kho).localeCompare(q.kho)||H.byCode(p,q)).map((it,i)=>{
    let o=0,inn=0,out=0;S.tx.filter(t=>t.item===it.code&&!t.void).forEach(t=>{const q=Number(t.qty)||0,sg=t.type==='out'?-q:q;
      if(t.date<a)o+=sg;else if(t.date<=b){if(sg>=0)inn+=sg;else out+=-sg}});
    return[i+1,it.kho||'',it.code,it.name,it.unit||'',o,inn,out,o+inn-out,it.min===''||it.min==null?'':it.min]});
  const r=sheetAoa('Báo cáo nhập, xuất, tồn kho',mLabel(),[head],rows,head.length);
  return{name:'nhap-xuat-ton-'+y+'-'+pad(m),aoa:r.aoa,merges:r.merges,widths:[5,18,12,28,8,12,12,12,12,12]}}},
 {id:'issue',label:'Sổ cấp phát vật tư và bảo hộ lao động',tab:'BC_CapPhat',desc:'Ai nhận gì, ngày nào, số lượng, đã ký nhận chưa, trong tháng đang chọn.',build(){
  const y=S.month.y,m=S.month.m,p=y+'-'+pad(m)+'-';
  const head=['STT','Ngày cấp','Mã NV','Họ và tên người nhận','Mã vật tư','Tên vật tư','ĐVT','Số lượng','Kho','Ký nhận','Ngày ký','Ghi chú'];
  const rows=S.issues.filter(i=>String(i.date).indexOf(p)===0).sort((u,v)=>String(u.date).localeCompare(v.date)).map((i,k)=>[k+1,fmt(i.date),i.empCode,i.empName,i.itemCode,i.itemName,i.unit||'',i.qty,i.kho||'',H.issSigned(i)?'Đã ký':'Chờ ký',i.signedAt?H.fmtTs(i.signedAt):'',i.note||'']);
  const r=sheetAoa('Sổ cấp phát vật tư, bảo hộ lao động',mLabel(),[head],rows,head.length);
  return{name:'so-cap-phat-'+y+'-'+pad(m),aoa:r.aoa,merges:r.merges,widths:[5,12,10,24,12,26,8,10,18,10,16,20]}}}
];
H.REP=REP;
})();
