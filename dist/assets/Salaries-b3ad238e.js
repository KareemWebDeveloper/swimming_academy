import{d as pe,u as me,j as _e,r as n,o as he,k as ve,l as fe,C as ye,a as r,c,b as o,w as i,e as s,g as l,m as R,f as h,F as U,h as k,t as u,n as O,p as S,s as x,v as be,x as ge,y as xe,q as we,z as b,A as C}from"./index-54b3e273.js";import{s as z,a as H,b as ke}from"./inlinemessage.esm-9b16a9f3.js";import{s as m}from"./column.esm-188ee393.js";import{s as K}from"./successMsg-2def3ef6.js";import"./calendar.esm-ee3de14d.js";import{i as Se}from"./isEmployeeAuthorizedFor-df272e7f.js";import"./index.esm-8fb1d516.js";/* empty css                                                   */const Ce={class:"flex flex-column lg:flex-row justify-content-between align-items-center"},De={class:"hidden md:my-2 lg:my-0 md:flex"},Fe={class:"p-input-icon-left"},Te=l("i",{class:"pi pi-search"},null,-1),Ae={key:1,class:"px-3 py-2 textColor text-center borderRound error"},Ee={class:"mt-3"},Ne=l("div",{class:"flex align-items-center"},[l("label",{for:"discount",class:"px-3 py-1 text-white text-sm"},"خصم ( اختياري )")],-1),Me={class:"mt-3"},Ve=l("div",{class:"flex align-items-center"},[l("label",{for:"bonus",class:"px-3 py-1 text-white text-sm"},"البونص ( اختياري )")],-1),$e={class:"mt-3"},je=l("div",{class:"flex align-items-center"},[l("label",{for:"amount",class:"px-3 py-1 text-white text-sm"},"الراتب النهائي")],-1),Ie={class:"mt-3"},Le=l("div",{class:"flex align-items-center"},[l("label",{for:"notes",class:"px-3 py-1 text-white text-sm"},"الملاحظات ( اختياري )")],-1),Be={class:"w-12 md:w-10 my-5 m-auto p-2 md:p-5 branchesList",style:{direction:"rtl"}},Re={class:"w-full m-auto flex justify-content-center p-4 MargAutoMob padding-1-breadcrumbs",style:{direction:"ltr"}},Ue=l("h2",{class:"text-center my-3 text-white"},"تقرير المرتبات",-1),Oe={class:"flex flex-column lg:flex-row justify-content-between align-items-center"},ze={class:"flex align-content-center justify-content-center"},He={class:"flex"},Ke={key:0,class:"mx-2"},qe={key:1,class:"mx-2"},Qe={key:2,class:"mx-2"},Ze={key:3,class:"mx-2"},Ge={key:4,class:"mx-2"},Je={class:"p-input-icon-left"},We=l("i",{class:"pi pi-search"},null,-1),Xe={key:0},Ye={key:1},Pe={key:0},ea={key:1},aa={key:0},ta={key:1},la={key:0,class:"flex align-items-center"},oa=["onClick"],sa={key:1,class:"flex align-items-center"},na=["onClick"],ia={key:1,class:"material-symbols-outlined cursor-pointer hoverIcon textColor text-4xl p-2 borderRound"},ra=l("i",{class:"pi pi-spin pi-spinner text-white",style:{"font-size":"2rem"}},null,-1),da=[ra],ca={class:"py-2"},ua={class:"textColor text-center mb-3"},pa={class:"text-center textColor"},ma={style:{background:"rgba(0, 128, 0, 0.932)"},class:"p-1 px-3 borderRound"},ka=pe({__name:"Salaries",setup(_a){const{push:E}=me(),q=_e(),D=n(!1),Q=n(!1),Z=n(!1),G=n(!0),F=n(!1),J=n(!1),W=n(!1),X=n(!1),N=n(!1),$=n(),w=n(!1),T=n(!1),Y=n(),v=n([]),M=n(0),f=n(),g=n(),j=n([]);j.value=[{label:"تقرير المرتبات",route:"/salaries",to:"/salaries"}];const P=n({icon:"pi pi-home",to:"/"}),ee=(t,a)=>{q.require({target:t.currentTarget,message:"هل متأكد أنك تريد صرف الراتب لهذا الموظف ؟",icon:"pi pi-exclamation-triangle",acceptLabel:"نعم",rejectLabel:"لا",accept:()=>{ie(a)},reject:()=>{}})},p=n({global:{value:null,matchMode:b.CONTAINS},id:{operator:C.AND,constraints:[{value:null,matchMode:b.CONTAINS}]},name:{operator:C.AND,constraints:[{value:null,matchMode:b.CONTAINS}]},job:{operator:C.AND,constraints:[{value:null,matchMode:b.EQUALS}]},last_paid_date:{operator:C.AND,constraints:[{value:null,matchMode:b.DATE_AFTER},{value:null,matchMode:b.DATE_BEFORE}]},expected_salary:{operator:C.AND,constraints:[{value:null,matchMode:b.CONTAINS}]}}),ae={weekday:"long",year:"numeric",month:"long",day:"numeric",hour12:!0,timeZone:"Africa/Cairo",locale:"ar"},te=new Intl.DateTimeFormat("ar",ae),le=t=>{N.value=!0,k.get(`http://127.0.0.1:8000/api/coach/attendances/${t}`).then(a=>{$.value=a.data.attendances,F.value=!0,N.value=!1}).catch(a=>{console.log(a)})},A=()=>{D.value=!1,k.get("http://127.0.0.1:8000/api/expectedSalaries").then(t=>{v.value=[],t.data.coaches.forEach(a=>{v.value.push({id:a.id,name:a.name,job:"مدرب",last_paid_date:a.last_paid_date?new Date(a.last_paid_date):"لم يصرف له مرتب",hours_worked:a.hours_worked,expected_salary:parseFloat(a.salary_per_hour)*parseFloat(a.hours_worked)})}),t.data.employees.forEach(a=>{v.value.push({id:a.id,name:a.name,job:"موظف",hours_worked:"-",last_paid_date:a.last_paid_date?new Date(a.last_paid_date):"لم يصرف له مرتب",expected_salary:parseFloat(a.salary)})}),ce(),Q.value=!1,G.value=!1,D.value=!0,console.log(v.value)}).catch(t=>{D.value=!0,console.log(t)})},oe=[],se=n([{label:"كل الفروع",value:0}]),ne=n([]);n([]);const I=()=>{k.get("http://127.0.0.1:8000/api/branches").then(t=>{console.log(t.data),t.data.branches.forEach(a=>{se.value.push({label:a.branch_name,value:a.id}),ne.value.push({label:a.branch_name,value:a.id}),oe.push({label:a.branch_name,value:a.id})}),Z.value=!0}).catch(t=>{console.log(t)})},ie=t=>{k.post(`http://127.0.0.1:8000/api/payEmployeeSalary/${t}`).then(a=>{console.log(a.data),window.scrollTo({top:0,behavior:"smooth"}),w.value=!0,setTimeout(()=>{w.value=!1},5e3),A()}).catch(a=>{console.log(a)})},re=t=>{T.value=!0,k.post(`http://127.0.0.1:8000/api/payCoachSalary/${g.value.id}`,t).then(a=>{T.value=!1,console.log(a.data),window.scrollTo({top:0,behavior:"smooth"}),F.value=!1,w.value=!0,A(),setTimeout(()=>{w.value=!1},5e3)}).catch(a=>{console.log(a),T.value=!1})},de=()=>{console.log(f.value),f.value.discount&&(f.value.amount=parseFloat(g.value.expected_salary)-parseFloat(f.value.discount)),f.value.bonus&&(f.value.amount=parseFloat(g.value.expected_salary)+parseFloat(f.value.bonus))},V=n(),ce=()=>{let t=v.value,a=!0,_=0;console.log(t),p.value.last_paid_date.constraints.forEach(e=>{e.value&&(a=!1,e.matchMode=="dateAfter"&&t.length>0&&(t=t.filter(d=>d.last_paid_date>new Date(e.value))),e.matchMode=="dateBefore"&&t.length>0&&(t=t.filter(d=>d.last_paid_date<new Date(e.value))),e.matchMode=="dateIs"&&t.length>0&&(e.value=new Date(e.value),e.value.setHours(0,0,0,0),t=t.filter(d=>{console.log(d),console.log(d.last_paid_date,"from inside filter");const y=new Date(d.last_paid_date);return y.setHours(0,0,0,0),y.getTime()==e.value.getTime()})),e.matchMode=="dateIsNot"&&t.length>0&&(e.value=new Date(e.value),e.value.setHours(0,0,0,0),t=t.filter(d=>{const y=new Date(d.last_paid_date);return y.setHours(0,0,0,0),y.getTime()!==e.value.getTime()})))}),a?(v.value.forEach(e=>{_+=parseFloat(e.expected_salary)}),M.value=_):(t.forEach(e=>{_+=parseFloat(e.cost)}),M.value=_)},L=n(),B=n("admin");he(()=>{ve().then(t=>{t==!1?fe().then(a=>{a==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),E({path:"/login"})),L.value=a.permissions,B.value="employee",Se(L.value,"الحسابات المالية",B.value)||(localStorage.removeItem("SwimmingToken"),location.reload(),E({path:"/login"})),I(),A()}):(I(),A())})});const ue=()=>{V.value.exportCSV()};return(t,a)=>{const _=ye("FormKit");return r(),c(U,null,[o(s(be),{visible:F.value,"onUpdate:visible":a[3]||(a[3]=e=>F.value=e),class:"attendancesDialog",maximizable:"",modal:"",header:"جدول حضور المدرب",style:{width:"65vw"},breakpoints:{"960px":"75vw","641px":"100vw"}},{footer:i(()=>[]),default:i(()=>[o(s(z),{filters:p.value,"onUpdate:filters":a[1]||(a[1]=e=>p.value=e),ref_key:"dt",ref:V,stripedRows:"",value:$.value,paginator:"",rows:10,rowsPerPageOptions:[10,20,50],filterDisplay:"menu",dataKey:"id",removableSort:"",globalFilterFields:["id","category_name"],tableStyle:"min-width: 50rem"},{header:i(()=>[l("div",Ce,[l("h3",De,"كابتن / "+u(g.value.name),1),l("span",Fe,[Te,o(s(O),{modelValue:p.value.global.value,"onUpdate:modelValue":a[0]||(a[0]=e=>p.value.global.value=e),placeholder:"بحث شامل"},null,8,["modelValue"])])])]),empty:i(()=>[o(s(H),{severity:"info"},{default:i(()=>[S("لا يوجد حضرور للمدرب منذ أخر راتب صرف له")]),_:1})]),default:i(()=>[o(s(m),{field:"branch.branch_name",sortable:"",header:"الفرع"}),o(s(m),{field:"training_start_time",sortable:"",header:"موعد التمرين",style:{width:"22%"}},{body:i(e=>[l("p",null,u(new Date(`2000-01-01 ${e.data.training_start_time}`).toLocaleTimeString("en-US",{hour12:!0})),1)]),_:1}),o(s(m),{field:"session_duration",sortable:"",header:"مدة التمرين",style:{width:"21%"}},{body:i(e=>[l("p",null,u(e.data.session_duration)+" ساعة",1)]),_:1}),o(s(m),{field:"created_at",sortable:"",header:"التاريخ"},{body:i(e=>[l("p",null,u(new Date(e.data.created_at).toLocaleDateString()),1)]),_:1}),o(s(m),{field:"created_at",header:"موعد الجضور"},{body:i(e=>[l("p",null,u(new Date(e.data.created_at).toLocaleTimeString()),1)]),_:1})]),_:1},8,["filters","value"]),o(_,{modelValue:f.value,"onUpdate:modelValue":a[2]||(a[2]=e=>f.value=e),type:"form",actions:!1,onSubmit:re},{default:i(()=>[X.value?(r(),R(K,{key:0,class:"fadeinright animation-duration-500 animation-iteration-1 my-4"},{default:i(()=>[S("تم الحفظ بنجاح")]),_:1})):h("",!0),J.value?(r(),c("h5",Ae,u(W.value),1)):h("",!0),l("div",Ee,[Ne,o(_,{"prefix-icon":"dollar",id:"discount",type:"number",number:"float",label:"الخصم",placeholder:"يرجي ادخال مبلغ الخصم",name:"discount",validation:"min:0"})]),l("div",Me,[Ve,o(_,{"prefix-icon":"dollar",id:"bonus",type:"number",number:"float",label:"البونص",placeholder:"يرجي ادخال مبلغ المكافأة",name:"bonus",validation:"min:0"})]),o(s(x),{type:"button",class:"mx-auto",label:"احسب الراتب النهائي",onClick:de}),l("div",$e,[je,o(_,{"prefix-icon":"dollar",value:g.value.expected_salary,id:"amount",type:"number",number:"float",label:"الراتب",placeholder:"يرجي ادخال الراتب النهائي للمدرب",name:"amount",validation:"required|min:0"},null,8,["value"])]),l("div",Ie,[Le,o(_,{"prefix-icon":"tools",id:"notes",type:"textarea",label:"الملاحظات",placeholder:"يرجي ادخال ملاحظات ان وجدت",name:"notes",validation:""})]),o(s(x),{type:"submit",class:"submitBtn",label:"دفع",loading:T.value},null,8,["loading"])]),_:1},8,["modelValue"])]),_:1},8,["visible"]),l("div",Be,[l("div",Re,[o(s(ge),{home:P.value,model:j.value},null,8,["home","model"])]),o(s(xe)),l("div",null,[w.value?(r(),R(K,{key:0,class:"fadeinright animation-duration-500 animation-iteration-1 my-4"},{default:i(()=>[S("تم الصرف بنجاح")]),_:1})):h("",!0),Ue,o(s(z),{filters:p.value,"onUpdate:filters":a[7]||(a[7]=e=>p.value=e),ref_key:"dt",ref:V,"export-filename":Y.value,stripedRows:"",value:v.value,loading:!D.value,filterDisplay:"menu",paginator:"",rows:10,rowsPerPageOptions:[10,20,50,100],dataKey:"id",removableSort:"",globalFilterFields:["name","id","job","expected_salary"],tableStyle:"min-width: 50rem"},{header:i(()=>[l("div",Oe,[o(s(x),{type:"button",class:"mb-2 lg:mb-0 mx-2",onClick:a[4]||(a[4]=e=>s(E)("/expenses")),label:"المصروفات"}),l("div",ze,[(r(!0),c(U,null,we(p.value.last_paid_date.constraints,(e,d)=>(r(),c("div",He,[e.value&&e.matchMode=="dateIsNot"?(r(),c("p",Ke,"المرتبات ما عدا "+u(new Date(e.value).toLocaleDateString()),1)):h("",!0),e.value&&e.matchMode=="dateIs"?(r(),c("p",qe,"المرتبات في "+u(new Date(e.value).toLocaleDateString()),1)):h("",!0),e.value&&e.matchMode=="dateAfter"?(r(),c("p",Qe,"المرتبات بعد "+u(new Date(e.value).toLocaleDateString()),1)):h("",!0),e.value&&e.matchMode=="dateBefore"?(r(),c("p",Ze,"المرتبات قبل "+u(new Date(e.value).toLocaleDateString()),1)):h("",!0),p.value.last_paid_date.constraints[d+1]&&p.value.last_paid_date.constraints[d+1].value?(r(),c("p",Ge," مع ")):h("",!0)]))),256))]),l("span",Je,[We,o(s(O),{modelValue:p.value.global.value,"onUpdate:modelValue":a[5]||(a[5]=e=>p.value.global.value=e),placeholder:"بحث شامل"},null,8,["modelValue"])])])]),empty:i(()=>[o(s(H),{severity:"info"},{default:i(()=>[S("غير موجود")]),_:1})]),paginatorend:i(()=>[o(s(x),{type:"button",icon:"pi pi-download",onClick:a[6]||(a[6]=e=>ue(e)),text:""})]),footer:i(()=>[l("div",ca,[l("h4",ua,"في المجموع هناك "+u(v.value?v.value.length:0)+" مرتبات ",1),l("h3",pa,[S("اجمالي المرتبات : "),l("span",ma,u(M.value.toFixed(2))+" ج.م",1)])])]),default:i(()=>[o(s(m),{field:"id",sortable:"",header:"الكود"}),o(s(m),{field:"name",sortable:"",header:"الاسم",style:{width:"20%"}},{body:i(e=>[e.data.job=="مدرب"?(r(),c("p",Xe,"كابتن / "+u(e.data.name),1)):(r(),c("p",Ye,u(e.data.name),1))]),_:1}),o(s(m),{field:"job",header:"الوظيفة",style:{width:"17%"}},{filter:i(({filterModel:e,filterCallback:d})=>[o(s(ke),{modelValue:e.value,"onUpdate:modelValue":y=>e.value=y,onChange:y=>d(),options:["مدرب","موظف"],placeholder:"اختر الوظيفة",class:"p-column-filter noDropDownFilterOptions",style:{"min-width":"12rem"},showClear:!0},null,8,["modelValue","onUpdate:modelValue","onChange"])]),filterapply:i(({filterCallback:e})=>[o(s(x),{type:"button",onClick:d=>e(),class:"mb-3 lg:mb-0 mx-2",label:"تفعيل"},null,8,["onClick"])]),filterclear:i(({filterCallback:e})=>[o(s(x),{type:"button",onClick:d=>e(),class:"mb-3 lg:mb-0 mx-2",label:"الغاء",outlined:""},null,8,["onClick"])]),_:1}),o(s(m),{field:"last_paid_date",filterField:"last_paid_date",dataType:"date",sortable:"",header:"تاريخ آخر قبض",style:{width:"24%"}},{body:i(e=>[e.data.last_paid_date=="لم يصرف له مرتب"?(r(),c("p",Pe,u(e.data.last_paid_date),1)):(r(),c("p",ea,u(s(te).format(new Date(e.data.last_paid_date))),1))]),_:1}),o(s(m),{field:"expected_salary",sortable:"",header:"المرتب"},{body:i(e=>[e.data.job=="مدرب"?(r(),c("p",aa,u(e.data.expected_salary)+" ج.م / "+u(e.data.hours_worked)+" ساعات",1)):(r(),c("p",ta,u(e.data.expected_salary)+" ج.م",1))]),_:1}),o(s(m),{header:"صرف"},{body:i(e=>[e.data.job=="موظف"?(r(),c("div",la,[l("span",{class:"material-symbols-outlined cursor-pointer hoverIcon textColor text-4xl p-2 borderRound",onClick:d=>ee(d,e.data.id)}," finance_chip ",8,oa)])):h("",!0),e.data.job=="مدرب"?(r(),c("div",sa,[N.value?(r(),c("span",ia,da)):(r(),c("span",{key:0,class:"material-symbols-outlined cursor-pointer hoverIcon textColor text-4xl p-2 borderRound",onClick:d=>{le(e.data.id),g.value=e.data}}," finance_chip ",8,na))])):h("",!0)]),_:1})]),_:1},8,["filters","export-filename","value","loading"])])])],64)}}});export{ka as default};
