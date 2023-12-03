import{d as q,u as P,r as n,o as U,h as F,a as l,c as i,g as e,t as h,b as m,w as r,e as c,f,F as y,q as C,E as w,p as R,s as V,z as k}from"./index-5ed95cfa.js";import{a as L,s as O}from"./inlinemessage.esm-b859ab3c.js";import{s as x}from"./column.esm-6404a039.js";import"./timeline.esm-a6935538.js";import{s as K}from"./calendar.esm-0476f178.js";import"./index.esm-93947ef4.js";const Q={key:0,class:"w-full md:w-9 p-5 mx-auto",style:{"margin-bottom":"12vh"}},Z={key:0},G=e("h2",{class:"text-center text-white fadein animation-duration-500 my-3 animation-iteration-1"},"الصفحة الشخصية",-1),H={class:"flipright boxShadowRight animation-duration-1000 animation-iteration-1 p-3 py-2 bg-card borderRound flex justify-content-center align-items-center"},J={class:"flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column"},W=e("div",{class:"flex align-items-center my-2"},[e("h4",{class:"primaryColor"},"الاسم"),e("span",{class:"material-symbols-outlined primaryColor text-2xl"}," person ")],-1),X={class:"textColor"},Y={class:"flex my-3 lg:my-1 align-items-center mx-4 justify-content-center flex-column"},ee=e("div",{class:"flex align-items-center my-2"},[e("h4",{class:"primaryColor"},"الكود"),e("span",{class:"material-symbols-outlined primaryColor mx-1 text-2xl"}," fingerprint ")],-1),te={class:"textColor"},oe=e("h2",{class:"textColor text-center my-5"},"جدول الحضور",-1),se={class:"fadein animation-duration-1000 animation-iteration-1"},ae={key:1,style:{direction:"rtl"}},ne=e("h2",{class:"text-center textColor"},"المرتبات",-1),le=[ne],ie={key:2},re=e("h2",{class:"text-center textColor"},"مواعيد التمارين",-1),ce={class:"bg-card shadowBottom borderRound p-2 my-5 zoomin animation-duration-1000 animation-ease-in-out animation-iteration-1"},de={class:"flex align-items-center p-2"},me={class:"primaryColor"},ue=e("span",{class:"material-symbols-outlined primaryColor mx-1 text-2xl"}," today ",-1),he={class:"bg-card borderRound"},_e={class:"flex flex-wrap align-items-start justify-content-center",style:{"border-top":"solid 2px white"}},pe={class:"flex my-3 lg:my-1 align-items-center mx-3 justify-content-center flex-column"},fe=e("div",{class:"flex align-items-center my-2"},[e("h4",{class:"primaryColor"},"الساعة"),e("span",{class:"material-symbols-outlined primaryColor mx-1 text-2xl"}," hourglass_top ")],-1),ye={class:"flex align-items-center justify-content-center"},xe={class:"textColor my-2"},ve={class:"flex my-3 lg:my-1 align-items-center mx-3 justify-content-center flex-column"},ge=e("div",{class:"flex align-items-center my-2"},[e("h4",{class:"primaryColor"},"الفرع"),e("span",{class:"material-symbols-outlined primaryColor mx-1 text-2xl"}," home ")],-1),be={class:"flex flex-column align-items-center justify-content-center"},Ce={class:"textColor my-2"},we={key:0,class:"flex justify-content-center align-items-center"},ke=e("p",{class:"textColor text-center borderRound py-2 px-2",style:{"background-color":"rgba(201, 75, 99, 0.7)"}},"هناك تعارض في المواعيد يرجي التواصل مع الادارة لحل المشكلة",-1),$e=[ke],je={class:"fixed z-5 p-4 gredBgg w-full flex justify-content-center",style:{bottom:"2px","margin-top":"4vh"}},Ee=q({__name:"CoachProfile",setup(Se){const{push:z,currentRoute:A}=P(),E=["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];n(!1),n(!1);const $=n(!0),j=n(!1),v=n(),S=n(),g=n([]),_=n(),T=n(),d=n("home"),B=n({global:{value:null,matchMode:k.CONTAINS},category_name:{value:"",matchMode:k.EQUALS},created_at:{value:null,matchMode:k.DATE_AFTER}}),D={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour12:!0,timeZone:"Africa/Cairo",locale:"ar"},I=new Intl.DateTimeFormat("ar",D),N=()=>{F.post("https://akademia.website/api/coachAuthorize").then(s=>{v.value=s.data.coach,S.value=s.data.subscriptions,T.value=s.data.salaries,_.value=s.data.attendances,_.value.forEach(o=>{o.created_at=new Date(o.created_at)}),S.value.forEach(o=>{o.training_schedules.forEach(t=>{t.branch=o.branch.branch_name,t.category=o.category_name,g.value.push(t)})}),j.value=!0,M(),console.log(g.value)}).catch(s=>{console.log(s),z({path:"/login",query:A.value.query})})},b=n([]),M=()=>{const s={};for(const o of g.value){const{day:t,time:a,branch:u}=o,p=`${t}-${a}`;s[p]?s[p].branches.includes(u)||(s[p].branches.push(u),s[p].conflict=!0):s[p]={day:t,time:a,branches:[u],conflict:!1}}for(const o in s)b.value.push(s[o]);console.log(b.value)};return U(()=>{let s=localStorage.getItem("SwimmingToken");s&&(F.defaults.headers.common.Authorization=`Bearer ${s}`,N()),setTimeout(()=>{$.value=!1},2400)}),(s,o)=>(l(),i(y,null,[!$.value&&j.value?(l(),i("div",Q,[d.value=="home"?(l(),i("div",Z,[G,e("div",H,[e("div",J,[W,e("p",X,h(v.value.name.split(" ").slice(0,2).join(" ")),1)]),e("div",Y,[ee,e("p",te,h(v.value.id),1)])]),oe,e("div",se,[m(c(O),{filters:B.value,"onUpdate:filters":o[0]||(o[0]=t=>B.value=t),ref:"dt",stripedRows:"",value:_.value,paginator:"",rows:10,rowsPerPageOptions:[10,20,50,100],filterDisplay:"menu",dataKey:"id",removableSort:"",globalFilterFields:["id","category_name"],tableStyle:"min-width: 50rem"},{header:r(()=>[]),empty:r(()=>[m(c(L),{severity:"info"},{default:r(()=>[R("لا يوجد حضور")]),_:1})]),footer:r(()=>[R(" في المجموع هناك "+h(_.value?_.value.length:0)+" حضور للتمارين ",1)]),default:r(()=>[m(c(x),{field:"session_duration",sortable:"",header:"مدة التمرين",style:{width:"20%"}},{body:r(t=>[e("p",null,h(t.data.session_duration)+" ساعة",1)]),_:1}),m(c(x),{field:"branch.branch_name",sortable:"",header:"الفرع",style:{width:"15%"}}),m(c(x),{field:"created_at",sortable:"",header:"تاريخ الانشاء",style:{}},{body:r(t=>[e("p",null,h(c(I).format(new Date(t.data.created_at))),1)]),filter:r(({filterModel:t,filterCallback:a})=>[m(c(K),{modelValue:t.value,"onUpdate:modelValue":u=>t.value=u,onInput:u=>a(),placeholder:"تاريخ الحضور من بعد",showIcon:"",showButtonBar:"",inputId:"created_at"},null,8,["modelValue","onUpdate:modelValue","onInput"])]),filterapply:r(({filterCallback:t})=>[m(c(V),{type:"button",onClick:a=>t(),class:"mb-3 lg:mb-0 mx-2",label:"تفعيل"},null,8,["onClick"])]),filterclear:r(({filterCallback:t})=>[m(c(V),{type:"button",onClick:a=>t(),class:"mb-3 lg:mb-0 mx-2",label:"الغاء",outlined:""},null,8,["onClick"])]),_:1}),m(c(x),{field:"category.category_name",sortable:"",header:"نوع التمرين",style:{width:"20%"}})]),_:1},8,["filters","value"])])])):f("",!0),d.value=="installments"?(l(),i("div",ae,le)):f("",!0),d.value=="subscriptions"?(l(),i("div",ie,[re,(l(),i(y,null,C(E,t=>e("div",ce,[e("div",de,[e("h2",me,h(t),1),ue]),(l(!0),i(y,null,C(b.value.filter(a=>a.day==t),a=>(l(),i("div",null,[e("div",he,[e("div",_e,[e("div",pe,[fe,e("div",ye,[e("p",xe,h(a.time.split(":").slice(0,2).join(":")),1)])]),e("div",ve,[ge,e("div",be,[(l(!0),i(y,null,C(a.branches,u=>(l(),i("p",Ce,h(u),1))),256))])])]),a.conflict?(l(),i("div",we,$e)):f("",!0)])]))),256))])),64))])):f("",!0)])):f("",!0),e("nav",je,[e("span",{class:w(["material-symbols-outlined text-5xl mx-5 textColor",{underline:d.value=="installments"}]),onClick:o[1]||(o[1]=t=>d.value="installments")}," monetization_on ",2),e("span",{class:w(["material-symbols-outlined text-5xl mx-5 textColor",{underline:d.value=="subscriptions"}]),onClick:o[2]||(o[2]=t=>d.value="subscriptions")}," supervisor_account ",2),e("span",{class:w(["material-symbols-outlined text-5xl mx-5 textColor",{underline:d.value=="home"}]),onClick:o[3]||(o[3]=t=>d.value="home")}," home ",2)])],64))}});export{Ee as default};
