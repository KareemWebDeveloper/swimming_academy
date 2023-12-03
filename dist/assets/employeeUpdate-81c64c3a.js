import{d as j,u as A,r as s,o as $,k as M,l as N,C as P,a as u,c as g,b as a,w as b,e as w,g as e,m as K,f as E,t as p,F as H,h,s as z,v as L}from"./index-54b3e273.js";import{s as G}from"./successMsg-2def3ef6.js";import"./inputswitch.esm-f7379264.js";import{i as J}from"./isEmployeeAuthorizedFor-df272e7f.js";/* empty css                                                   */const O={class:"flex align-items-center justify-content-center"},Q={class:"flex align-items-center mx-5 justify-content-center flex-column"},W=e("div",{class:"flex align-items-center my-2"},[e("span",{class:"material-symbols-outlined mx-1 text-2xl"}," tag "),e("h4",null,"الكود")],-1),X={class:"flex align-items-center mx-5 justify-content-center flex-column"},Y=e("div",{class:"flex align-items-center my-2"},[e("h4",null,"الاسم"),e("span",{class:"material-symbols-outlined text-2xl"}," scuba_diving ")],-1),Z={class:"flex align-items-center mx-5 justify-content-center flex-column"},ee=e("div",{class:"flex align-items-center my-2"},[e("span",{class:"material-symbols-outlined mx-1 text-2xl"}," monetization_on "),e("h4",null,"الراتب")],-1),le={class:"w-12 md:w-10 m-auto p-2 md:p-5 branches"},te=e("h1",{class:"p-4 text-center textColor"},"تعديل موظف",-1),se={class:"w-8 m-auto"},ae={key:1,class:"px-3 py-2 textColor text-center borderRound error"},oe={key:0},ne={class:"flex grid w-full"},ie={class:"mt-3 col-12"},ce=e("div",{class:"flex align-items-center"},[e("label",{for:"name",class:"px-3 py-1 text-white text-sm"},"اسم الموظف")],-1),de={class:"mt-3 col-12 md:col-6"},re=e("div",{class:"flex align-items-center"},[e("label",{for:"mail",class:"px-3 py-1 text-white text-sm"},"البريد الالكتروني")],-1),me={class:"mt-3 col-12 md:col-6"},ue=e("div",{class:"flex align-items-center"},[e("label",{for:"phone",class:"px-3 py-1 text-white text-sm"},"رقم الهاتف")],-1),pe={class:"col-12 md:col-6"},he=e("div",{class:"flex align-items-center"},[e("label",{for:"Pw",class:"px-3 py-1 text-white text-sm"},"كلمة السر")],-1),ve={class:"col-12 md:col-6"},fe=e("div",{class:"flex align-items-center"},[e("label",{for:"salary_per_hour",class:"px-3 py-1 text-white text-sm"},"الراتب في الشهر")],-1),xe={class:"col-12"},_e=e("div",{class:"flex align-items-center"},[e("label",{for:"address",class:"px-3 py-1 text-white text-sm"},"عنوان الموظف")],-1),ye={class:"col-12"},ge=e("div",{class:"flex align-items-center"},[e("label",{for:"address",class:"px-3 py-1 text-white text-sm"},"الفروع التي يعمل بها")],-1),be={class:"col-12"},we=e("div",{class:"flex align-items-center"},[e("label",{for:"address",class:"px-3 py-1 text-white text-sm"},"الأدوار المتاحة")],-1),Be=j({__name:"employeeUpdate",setup(Ee){const{push:v,currentRoute:f}=A(),k=s([]),I=s([]),x=s(!1),_=s(!1);s(!1);const q=s(!1),C=s(!1),i=s(),c=s(!1),d=s(),F=s(),r=s(!1),B=parseInt(f.value.params.id),o=s(),D=t=>{c.value=!0,console.log(t),h.put(`http://127.0.0.1:8000/api/updateEmployee/${B}`,t).then(l=>{d.value=l.data.employee,c.value=!1,_.value=!1,x.value=!0,window.scrollTo({top:0,behavior:"smooth"}),setTimeout(()=>{r.value=!0,x.value=!1},1400)}).catch(l=>{window.scrollTo({top:0,behavior:"smooth"}),c.value=!1,_.value=!0,l.response.data.message.includes("The phone has already been taken")?i.value="هذا الهاتف موجود بالفعل":l.response.data.message.includes("The email has already been taken")?i.value="هذا البريد الالكتروني موجود بالفعل":i.value=l.response.data.message,console.log(l)})},T=()=>{h.get("http://127.0.0.1:8000/api/branches").then(t=>{console.log(t.data),t.data.branches.forEach(l=>{k.value.push({label:l.branch_name,value:l.id})}),q.value=!0}).catch(t=>{console.log(t)})},R=()=>{h.get("http://127.0.0.1:8000/api/roles").then(t=>{console.log(t.data),t.data.roles.forEach(l=>{I.value.push({label:l.role_name,value:l.id})}),C.value=!0}).catch(t=>{console.log(t)})},U=()=>{v("/employees")},S=()=>{h.get(`http://127.0.0.1:8000/api/employee/${B}`).then(t=>{o.value=t.data.employee,o.value.password="",o.value.branchIds=[],o.value.roleIds=[],t.data.employee.branches.forEach(l=>{o.value.branchIds.push(l.id)}),t.data.employee.roles.forEach(l=>{o.value.roleIds.push(l.id)}),console.log(o.value),F.value=!0}).catch(t=>{console.log(t)})},y=s(),V=s("admin");return $(()=>{M().then(t=>{t==!1?N().then(l=>{l==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),console.log("not employee"),v({path:"/login",query:f.value.query})),y.value=l.permissions,V.value="employee",J(y.value,"تسجيل و تعديل الموظفين",V.value)||(localStorage.removeItem("SwimmingToken"),console.log("not authorized"),location.reload(),v({path:"/login",query:f.value.query})),console.log(y.value),S(),T(),R()}):(S(),T(),R())})}),(t,l)=>{const n=P("FormKit");return u(),g(H,null,[a(w(L),{visible:r.value,"onUpdate:visible":l[1]||(l[1]=m=>r.value=m),onAfterHide:U,modal:"",header:"بيانات الموظف",style:{width:"50vw"}},{footer:b(()=>[a(w(z),{label:"تم",class:"px-4 py-1",onClick:l[0]||(l[0]=m=>r.value=!1),autofocus:""})]),default:b(()=>[e("div",O,[e("div",Q,[W,e("p",null,p(d.value.id),1)]),e("div",X,[Y,e("p",null,p(d.value.name),1)]),e("div",Z,[ee,e("p",null,p(d.value.salary.toFixed(2))+" ج.م / شهر",1)])])]),_:1},8,["visible"]),e("div",le,[te,e("div",se,[x.value?(u(),K(G,{key:0,class:"fadeinright animation-duration-1000 animation-iteration-1"})):E("",!0),_.value?(u(),g("h5",ae,p(i.value),1)):E("",!0)]),q.value&&C.value&&F.value?(u(),g("div",oe,[a(n,{type:"form",modelValue:o.value,"onUpdate:modelValue":l[2]||(l[2]=m=>o.value=m),actions:!1,onSubmit:D},{default:b(()=>[e("div",ne,[e("div",ie,[ce,a(n,{"prefix-icon":"avatarMan",id:"name",type:"text",label:"اسم الموظف",placeholder:"أدخل اسم الموظف",name:"name",validation:"required|length:2"})]),e("div",de,[re,a(n,{"prefix-icon":"email",id:"mail",type:"email",label:"البريد الالكتروني",placeholder:"أدخل البريد الالكتروني",name:"email",validation:"required|email"})]),e("div",me,[ue,a(n,{"prefix-icon":"telephone",id:"phone",type:"text",label:"اسم الموظف",placeholder:"أدخل رقم هاتف الموظف",name:"phone",validation:"required|length:10"})]),e("div",pe,[he,a(n,{"prefix-icon":"password",id:"Pw",type:"password",label:"كلمة السر",placeholder:"أدخل كلمة السر للموظف",name:"password",validation:"required|length:8"})]),e("div",ve,[fe,a(n,{"prefix-icon":"dollar",id:"salary",type:"text",label:"الراتب",placeholder:"أدخل الراتب للموظف ",number:"float",name:"salary",validation:"required|min:0"})]),e("div",xe,[_e,a(n,{"prefix-icon":"text",id:"address",type:"textarea",label:"العنوان",placeholder:"أدخل عنوان للموظف ",name:"address",validation:"required|length:3"})]),e("div",ye,[ge,a(n,{type:"dropdown",name:"branchIds",label:"الفروع",placeholder:"اختر الفروع التي يعمل بها الموظف",options:k.value,multiple:""},null,8,["options"])]),e("div",be,[we,a(n,{type:"dropdown",name:"roleIds",label:"الأدوار",placeholder:"اختر الأدوار التي سيقوم بها الموظف",options:I.value,multiple:""},null,8,["options"])])]),a(w(z),{type:"submit",class:"submitBtn",label:"تسجيل",loading:c.value},null,8,["loading"])]),_:1},8,["modelValue"])])):E("",!0)])],64)}}});export{Be as default};