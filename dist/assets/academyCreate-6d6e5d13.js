import{d as C,u as V,r as a,o as k,k as S,l as w,C as A,a as d,c as y,g as t,m as T,f as g,t as B,b as l,w as R,h as q,e as x,s as E}from"./index-54b3e273.js";import{s as z}from"./successMsg-2def3ef6.js";import{s as F}from"./inputswitch.esm-f7379264.js";import{i as N}from"./isEmployeeAuthorizedFor-df272e7f.js";/* empty css                                                   */const U={class:"w-12 md:w-10 m-auto p-2 md:p-5 branches"},D=t("h1",{class:"p-4 text-center textColor"},"انشاء أكاديمية جديدة",-1),I={class:"w-8 m-auto"},K={key:1,class:"px-3 py-2 textColor text-center borderRound error"},M={class:"mt-3"},P=t("div",{class:"flex align-items-center"},[t("label",{for:"academy_name",class:"px-3 py-1 text-white text-sm"},"اسم الأكاديمية")],-1),j={class:"flex justify-content-center align-items-center"},$=t("h4",{class:"text-sm mx-2 textColor"},"ابق في نفس الصفحة",-1),W=C({__name:"academyCreate",setup(G){const{push:n,currentRoute:p}=V();a([{label:"React",value:"react"},{label:"Vue",value:"vue"},{label:"Angular",value:"angular"},{label:"Svelte",value:"svelte"}]);const s=a(!1),v=a(),r=a(!1),i=a(!1),u=a(!1),c=a(),b=o=>{console.log(o),s.value=!0,q.post("http://127.0.0.1:8000/api/createAcademy",o).then(e=>{i.value=!0,u.value=!1,s.value=!1,r.value?setTimeout(()=>{i.value=!1,location.reload()},1700):setTimeout(()=>{n("/")},2500)}).catch(e=>{u.value=!0,e.response.data.message.includes("The academy name has already been taken.")?(c.value="هذه الأكاديمية موجودة بالفعل",s.value=!1):(c.value=e.response.data.message,s.value=!1),console.log(e)})},f=a(),_=a("admin");return k(()=>{S().then(o=>{o==!1&&w().then(e=>{e==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),n({path:"/login",query:p.value.query})),f.value=e.permissions,_.value="employee",N(f.value,"انشاء أكاديمية",_.value)||(localStorage.removeItem("SwimmingToken"),location.reload(),n({path:"/login",query:p.value.query}))})})}),(o,e)=>{const h=A("FormKit");return d(),y("div",U,[D,t("div",I,[i.value?(d(),T(z,{key:0,class:"fadeinright animation-duration-1000 animation-iteration-1"})):g("",!0),u.value?(d(),y("h5",K,B(c.value),1)):g("",!0)]),t("div",null,[l(h,{modelValue:v.value,"onUpdate:modelValue":e[1]||(e[1]=m=>v.value=m),type:"form",actions:!1,onSubmit:b},{default:R(()=>[t("div",M,[P,l(h,{"prefix-icon":"text",id:"academy_name",type:"text",label:"اسم الأكاديمية",placeholder:"أدخل اسم الأكاديمية",name:"academy_name",validation:"required|length:2"})]),t("div",j,[l(x(F),{modelValue:r.value,"onUpdate:modelValue":e[0]||(e[0]=m=>r.value=m)},null,8,["modelValue"]),$]),l(x(E),{type:"submit",class:"submitBtn",label:"انشاء",loading:s.value},null,8,["loading"])]),_:1},8,["modelValue"])])])}}});export{W as default};