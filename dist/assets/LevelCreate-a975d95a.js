import{d as w,u as k,r as l,o as C,k as T,l as S,C as q,a as m,c as x,g as e,m as B,f as g,t as V,b as a,w as p,h as L,e as y,s as N}from"./index-5ed95cfa.js";import{s as A}from"./successMsg-575c06f8.js";import{s as E}from"./inputswitch.esm-9e5e7f7f.js";import{i as R}from"./isEmployeeAuthorizedFor-df272e7f.js";/* empty css                                                   */const z={class:"w-12 md:w-10 m-auto p-2 md:p-5 branches"},F=e("h1",{class:"p-4 text-center textColor"},"انشاء مستوي جديد",-1),I={class:"w-8 m-auto"},K={key:1,class:"px-3 py-2 textColor text-center borderRound error"},M={class:"mt-3"},P=e("div",{class:"flex align-items-center"},[e("label",{for:"levelName",class:"px-3 py-1 text-white text-sm"},"اسم المستوي")],-1),U={class:"mt-3"},$=e("div",{class:"flex align-items-center"},[e("label",{for:"description",class:"px-3 py-1 text-white text-sm"},"وصف المستوي")],-1),j={class:"w-full m-auto repeater"},D={class:"col-12 flex grid w-full mt-3"},G={class:"flex grid w-full"},H={class:"flex justify-content-center align-items-center my-3"},J=e("h4",{class:"text-sm mx-2 textColor"},"ابق في نفس الصفحة",-1),te=w({__name:"LevelCreate",setup(O){const{push:r,currentRoute:v}=k();l([]);const h=l(!1),c=l(!1),d=l(!1);l(!1);const i=l(),n=l(!1),b=o=>{n.value=!0,console.log(o),L.post("https://akademia.website/api/createLevel",o).then(t=>{console.log(t.data),n.value=!1,c.value=!1,h.value=!0,window.scrollTo({top:0,behavior:"smooth"}),d.value?setTimeout(()=>{location.reload()},1600):setTimeout(()=>{r("/levels")},1600)}).catch(t=>{window.scrollTo({top:0,behavior:"smooth"}),n.value=!1,c.value=!0,t.response.data.message.includes("The level name has already been taken")?i.value="هذا المستوي موجود بالفعل":t.response.data.message.includes("The sublevel name has already been taken")?i.value="هناك مستوي الفرعي موجود بالفعل":i.value=t.response.data.message,console.log(t)})},f=l(),_=l("admin");return C(()=>{T().then(o=>{o==!1&&S().then(t=>{t==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),r({path:"/login",query:v.value.query})),f.value=t.permissions,_.value="employee",R(f.value,"المستويات",_.value)||(localStorage.removeItem("SwimmingToken"),location.reload(),r({path:"/login",query:v.value.query}))})})}),(o,t)=>{const s=q("FormKit");return m(),x("div",z,[F,e("div",I,[h.value?(m(),B(A,{key:0,class:"fadeinright animation-duration-1000 animation-iteration-1"})):g("",!0),c.value?(m(),x("h5",K,V(i.value),1)):g("",!0)]),e("div",null,[a(s,{type:"form",actions:!1,onSubmit:b},{default:p(()=>[e("div",M,[P,a(s,{"prefix-icon":"text",id:"levelName",type:"text",label:"اسم المستوي",placeholder:"أدخل اسم المستوي",name:"level_name",validation:"required|length:3"})]),e("div",U,[$,a(s,{"prefix-icon":"tools",id:"description",type:"textarea",label:"وصف المستوي",placeholder:"أدخل وصف المستوي",name:"level_description",validation:"length:3"})]),e("div",j,[a(s,{id:"repeater",name:"sublevels",type:"repeater",label:"المستوىات الفرعية","add-label":"اضافة مستوي فرعي"},{default:p(({index:u})=>[a(s,{type:"text","prefix-icon":"text",name:"sublevel_name",label:`${u+1}. اسم المستوي الفرعي`,placeholder:"أدخل اسم المستوي",validation:"required|length:3"},null,8,["label"]),e("div",D,[a(s,{id:"repeater",name:"checkpoints",type:"repeater","add-label":"اضافة مهارة",label:"مهارات المستوي"},{default:p(({index:Q})=>[e("div",G,[a(s,{type:"text",name:"checkpoint_name","outer-class":"col-12",label:"المهارة",placeholder:"أدخل المهارة المكتسبة","prefix-icon":"text",validation:"required|length:3"}),a(s,{type:"textarea",name:"checkpoint_description","outer-class":"col-12",label:"وصف المهارة",placeholder:"أدخل وصف المهارة","prefix-icon":"tools",validation:""})])]),_:2},1024)])]),_:1})]),e("div",H,[a(y(E),{modelValue:d.value,"onUpdate:modelValue":t[0]||(t[0]=u=>d.value=u)},null,8,["modelValue"]),J]),a(y(N),{type:"submit",class:"submitBtn",label:"انشاء",loading:n.value},null,8,["loading"])]),_:1})])])}}});export{te as default};
