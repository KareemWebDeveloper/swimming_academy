import{d as C,u as V,r as a,o as k,k as S,l as w,C as T,a as p,c as h,g as t,m as B,f as y,t as A,b as l,w as N,h as R,e as x,s as q}from"./index-54b3e273.js";import{s as z}from"./successMsg-2def3ef6.js";import{s as E}from"./inputswitch.esm-f7379264.js";import{i as F}from"./isEmployeeAuthorizedFor-df272e7f.js";/* empty css                                                   */const U={class:"w-12 md:w-10 m-auto p-2 md:p-5 branches"},D=t("h1",{class:"p-4 text-center textColor"},"انشاء نوع تمرين جديد",-1),I={class:"w-8 m-auto"},K={key:1,class:"px-3 py-2 textColor text-center borderRound error"},M={class:"mt-3"},P=t("div",{class:"flex align-items-center"},[t("label",{for:"categoryName",class:"px-3 py-1 text-white text-sm"},"نوع التمرينة")],-1),j={class:"flex justify-content-center align-items-center"},$=t("h4",{class:"text-sm mx-2 textColor"},"ابق في نفس الصفحة",-1),W=C({__name:"createCategory",setup(G){const{push:n,currentRoute:v}=V();a([{label:"React",value:"react"},{label:"Vue",value:"vue"},{label:"Angular",value:"angular"},{label:"Svelte",value:"svelte"}]);const o=a(!1),f=a(),r=a(!1),i=a(!1),u=a(!1),c=a(),b=s=>{console.log(s),o.value=!0,R.post("http://127.0.0.1:8000/api/createCategory",s).then(e=>{i.value=!0,u.value=!1,o.value=!1,r.value?setTimeout(()=>{i.value=!1,location.reload()},5e3):setTimeout(()=>{n("/categories")},2500)}).catch(e=>{u.value=!0,e.response.data.message.includes("The category name has already been taken.")?(c.value="هذا النوع موجود بالفعل",o.value=!1):(c.value=e.response.data.message,o.value=!1),console.log(e)})},m=a(),g=a("admin");return k(()=>{S().then(s=>{s==!1&&w().then(e=>{e==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),console.log("not employee"),n({path:"/login",query:v.value.query})),m.value=e.permissions,g.value="employee",F(m.value,"انشاء و تعديل أنواع التمارين",g.value)||(localStorage.removeItem("SwimmingToken"),console.log("not authorized"),location.reload(),n({path:"/login",query:v.value.query})),console.log(m.value)})})}),(s,e)=>{const _=T("FormKit");return p(),h("div",U,[D,t("div",I,[i.value?(p(),B(z,{key:0,class:"fadeinright animation-duration-1000 animation-iteration-1"})):y("",!0),u.value?(p(),h("h5",K,A(c.value),1)):y("",!0)]),t("div",null,[l(_,{modelValue:f.value,"onUpdate:modelValue":e[1]||(e[1]=d=>f.value=d),type:"form",actions:!1,onSubmit:b},{default:N(()=>[t("div",M,[P,l(_,{"prefix-icon":"text",id:"categoryName",type:"text",label:"نوع التمرين",placeholder:"أدخل نوع تمرين جديد",name:"category_name",validation:"required|length:3"})]),t("div",j,[l(x(E),{modelValue:r.value,"onUpdate:modelValue":e[0]||(e[0]=d=>r.value=d)},null,8,["modelValue"]),$]),l(x(q),{type:"submit",class:"submitBtn",label:"انشاء",loading:o.value},null,8,["loading"])]),_:1},8,["modelValue"])])])}}});export{W as default};
