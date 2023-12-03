import{d as T,u as q,r as l,o as B,k as N,l as E,C as V,a as i,c as h,g as o,m as z,f,t as A,b as s,w as _,h as k,e as C,s as F}from"./index-54b3e273.js";import{s as R}from"./successMsg-2def3ef6.js";import{s as j}from"./inputswitch.esm-f7379264.js";import{i as I}from"./isEmployeeAuthorizedFor-df272e7f.js";/* empty css                                                   */const K={class:"w-12 md:w-10 m-auto p-2 md:p-5 branches"},M=o("h1",{class:"p-4 text-center textColor"},"انشاء فرع جديد",-1),P={class:"w-8 m-auto"},U={key:1,class:"px-3 py-2 textColor text-center borderRound error"},$={key:0},D={class:"mt-3"},J=o("div",{class:"flex align-items-center"},[o("label",{for:"branchName",class:"px-3 py-1 text-white text-sm"},"اسم الفرع")],-1),L={class:"mt-3"},O=o("div",{class:"flex align-items-center"},[o("label",{for:"branchName",class:"px-3 py-1 text-white text-sm"},"أيام العمل")],-1),G={class:"w-full m-auto repeater"},H={class:"flex grid w-full"},Q={class:"col-12 flex grid w-full mt-3"},W={class:"flex grid w-full"},X={class:"flex justify-content-center align-items-center my-3"},Y=o("h4",{class:"text-sm mx-2 textColor"},"ابق في نفس الصفحة",-1),ne=T({__name:"branchCreate",setup(Z){const{push:c,currentRoute:v}=q(),g=l([]),b=l(!1),d=l(!1),u=l(!1),x=l(!1),m=l(),r=l(!1),S=t=>{r.value=!0,console.log(t),t.categories.forEach((e,a)=>{let n=JSON.stringify(e.session_prices);t.categories[a].session_prices=n,console.log(t,"req after stringfy"),console.log(n,"jsonString")}),k.post("http://127.0.0.1:8000/api/createBranch",t).then(e=>{console.log(e.data),r.value=!1,d.value=!1,b.value=!0,window.scrollTo({top:0,behavior:"smooth"}),u.value?setTimeout(()=>{location.reload()},1600):setTimeout(()=>{c("/branches")},1600)}).catch(e=>{window.scrollTo({top:0,behavior:"smooth"}),r.value=!1,d.value=!0,e.response.data.message.includes("The branch name has already been taken")?m.value="هذا الفرع موجود بالفعل":m.value=e.response.data.message,console.log(e)})},y=()=>{k.get("http://127.0.0.1:8000/api/categories").then(t=>{console.log(t.data),t.data.categories.forEach(e=>{g.value.push({label:e.category_name,value:e.id})}),x.value=!0}).catch(t=>{console.log(t)})},p=l(),w=l("admin");return B(()=>{N().then(t=>{t==!1?E().then(e=>{e==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),console.log("not employee"),c({path:"/login",query:v.value.query})),p.value=e.permissions,w.value="employee",I(p.value,"تسجيل و تعديل الفروع",w.value)||(localStorage.removeItem("SwimmingToken"),console.log("not authorized"),location.reload(),c({path:"/login",query:v.value.query})),console.log(p.value),y()}):y()})}),(t,e)=>{const a=V("FormKit");return i(),h("div",K,[M,o("div",P,[b.value?(i(),z(R,{key:0,class:"fadeinright animation-duration-1000 animation-iteration-1"})):f("",!0),d.value?(i(),h("h5",U,A(m.value),1)):f("",!0)]),x.value?(i(),h("div",$,[s(a,{type:"form",actions:!1,onSubmit:S},{default:_(()=>[o("div",D,[J,s(a,{"prefix-icon":"text",id:"branchName",type:"text",label:"اسم الفرع",placeholder:"أدخل اسم الفرع",name:"branch_name",validation:"required|length:3"})]),o("div",L,[O,s(a,{type:"dropdown","outer-class":"col-12",name:"working_days",label:"أيام العمل",placeholder:"اختر أيام العمل المتاحة لهذا الفرع",options:["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"],multiple:"true",validation:"required"})]),o("div",G,[s(a,{id:"repeater",name:"categories",type:"repeater",label:"نوع التمرينة"},{default:_(({index:n})=>[s(a,{type:"dropdown",name:"categoryId",label:`${n+1}. نوع التمرين`,placeholder:"اختر نوع تمرينة",options:g.value,validation:"required"},null,8,["label","options"]),o("div",H,[s(a,{type:"text",name:"duration",number:"float","outer-class":"col-12 md:col-6",label:"مدة التمرينة",placeholder:"أدخل مدة التمرينة بالساعة","prefix-icon":"number",validation:"required|min:0"}),s(a,{type:"text",name:"price_per_session",number:"float","outer-class":"col-12 md:col-6",label:"سعر التمرينة",placeholder:"أدخل سعر التمرينة","prefix-icon":"number",validation:"required|min:0"}),o("div",Q,[s(a,{id:"repeater",name:"session_prices",type:"repeater",label:"عروض علي أسعار التمارين"},{default:_(({index:ee})=>[o("div",W,[s(a,{type:"text",name:"sessions",number:"integer","outer-class":"col-12 md:col-6",label:"عدد الحصص",placeholder:"أدخل عدد الحصص","prefix-icon":"number",validation:"required|min:0"}),s(a,{type:"text",name:"price",number:"float","outer-class":"col-12 md:col-6",label:"السعر",placeholder:"أدخل سعر التمارين","prefix-icon":"dollar",validation:"required|min:0"})])]),_:2},1024)])])]),_:1})]),o("div",X,[s(C(j),{modelValue:u.value,"onUpdate:modelValue":e[0]||(e[0]=n=>u.value=n)},null,8,["modelValue"]),Y]),s(C(F),{type:"submit",class:"submitBtn",label:"انشاء",loading:r.value},null,8,["loading"])]),_:1})])):f("",!0)])}}});export{ne as default};
