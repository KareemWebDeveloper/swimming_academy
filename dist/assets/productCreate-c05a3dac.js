import{d as D,u as N,r as a,o as O,k as K,l as M,C as H,a as c,c as d,b as o,w as g,e as r,g as e,m as $,f as V,t as m,F as I,h as k,s as x,v as L}from"./index-54b3e273.js";import{s as G}from"./successMsg-2def3ef6.js";import{s as j}from"./inputswitch.esm-f7379264.js";import{s as J}from"./selectbutton.esm-6c460a53.js";/* empty css                                                   */const Q={class:"flex align-items-center justify-content-center"},W={class:"flex align-items-center mx-5 justify-content-center flex-column"},X=e("div",{class:"flex align-items-center my-2"},[e("span",{class:"material-symbols-outlined mx-1 text-2xl"}," wysiwyg "),e("h4",null,"المنتج")],-1),Y={class:"flex align-items-center mx-5 justify-content-center flex-column"},Z=e("div",{class:"flex align-items-center my-2"},[e("h4",null,"الكمية المتوفرة"),e("span",{class:"material-symbols-outlined text-2xl"}," inventory_2 ")],-1),ee={class:"flex align-items-center mx-5 justify-content-center flex-column"},te=e("div",{class:"flex align-items-center my-2"},[e("span",{class:"material-symbols-outlined mx-1 text-2xl"}," monetization_on "),e("h4",null,"سعر الشراء")],-1),le={key:0},oe={key:1},se={class:"w-12 md:w-10 m-auto p-2 md:p-5 branches"},ae={class:"flex justify-content-center mt-5 pt-5 m-auto",style:{direction:"rtl"}},ne={key:0,class:"p-4 text-center textColor"},ie={key:1,class:"p-4 text-center textColor"},ce={class:"w-8 my-4 m-auto"},re={key:1,class:"px-3 py-2 textColor text-center borderRound error"},ue={key:2},de={class:"flex grid w-full"},me={class:"mt-3 col-12"},pe=e("div",{class:"flex align-items-center"},[e("label",{for:"name",class:"px-3 py-1 text-white text-sm"},"اسم المنتج")],-1),ve={class:"mt-3 col-12 md:col-6"},_e=e("div",{class:"flex align-items-center"},[e("label",{for:"price",class:"px-3 py-1 text-white text-sm"},"سعر بيع المنتج")],-1),fe={class:"mt-3 col-12 md:col-6"},xe=e("div",{class:"flex align-items-center"},[e("label",{for:"price",class:"px-3 py-1 text-white text-sm"},"تكلفة المنتج ( الجملة )")],-1),he={class:"mt-3 col-12 md:col-12"},ye=e("div",{class:"flex align-items-center"},[e("label",{for:"count",class:"px-3 py-1 text-white text-sm"},"الكمية المتوفرة / كمية الشراء")],-1),be={class:"mt-3 col-12 md:col-12"},ge=e("div",{class:"flex align-items-center"},[e("label",{for:"totalPrice",class:"px-3 py-1 text-white text-sm"},"سعر الشراء النهائي")],-1),we={class:"flex justify-content-center align-items-center my-3"},Ve=e("h4",{class:"text-sm mx-2 textColor"},"ابق في نفس الصفحة",-1),ke={key:3},Ce={class:"flex grid w-full"},Pe={class:"mt-3 col-12"},Te=e("div",{class:"flex align-items-center"},[e("label",{for:"product",class:"px-3 py-1 text-white text-sm"},"المنتجات")],-1),Be={class:"mt-3 col-12 md:col-12"},Fe=e("div",{class:"flex align-items-center"},[e("label",{for:"count",class:"px-3 py-1 text-white text-sm"},"كمية الشراء")],-1),$e={class:"mt-3 col-12 md:col-12"},je=e("div",{class:"flex align-items-center"},[e("label",{for:"totalPrice",class:"px-3 py-1 text-white text-sm"},"سعر الشراء النهائي")],-1),Se={class:"flex justify-content-center align-items-center my-3"},Ue=e("h4",{class:"text-sm mx-2 textColor"},"ابق في نفس الصفحة",-1),Ne=D({__name:"productCreate",setup(Ae){const{push:C,currentRoute:S}=N(),p=a(!1),v=a(!1),_=a(!1),h=a(),u=a(!1),P=a(!1),y=a(),f=a(!1),U=a(["منتج جديد","منتج موجود"]),b=a("منتج جديد"),l=a(),w=a([]),T=a(),A=s=>{u.value=!0,console.log(s),k.post("http://127.0.0.1:8000/api/createProduct",s).then(t=>{y.value=t.data.product,u.value=!1,v.value=!1,p.value=!0,window.scrollTo({top:0,behavior:"smooth"}),p.value=!1,setTimeout(()=>{f.value=!0},1e3)}).catch(t=>{window.scrollTo({top:0,behavior:"smooth"}),u.value=!1,v.value=!0,t.response.data.message.includes("The product name has already been taken")?h.value="هذا المنتج موجود بالفعل":h.value=t.response.data.message,console.log(t)})},E=s=>{u.value=!0,console.log(s),k.post("http://127.0.0.1:8000/api/createBuyingOrder",s).then(t=>{y.value=t.data.product,u.value=!1,v.value=!1,p.value=!0,window.scrollTo({top:0,behavior:"smooth"}),p.value=!1,setTimeout(()=>{f.value=!0},1e3)}).catch(t=>{window.scrollTo({top:0,behavior:"smooth"}),u.value=!1,v.value=!0,h.value=t.response.data.message,console.log(t)})},B=s=>{if(s=="new"){if(!l.value.product_cost||!l.value.product_count)return;l.value.total_price=parseFloat(l.value.product_cost)*parseFloat(l.value.product_count)}else{if(console.log("exists"),!l.value.count||!l.value.product_id)return;const t=T.value.filter(i=>i.id==l.value.product_id);t.length>0&&(l.value.total_price=parseFloat(t[0].product_cost)*parseFloat(l.value.count),console.log(l.value.total_price))}},F=()=>{k.get("http://127.0.0.1:8000/api/products").then(s=>{T.value=s.data.products,s.data.products.forEach(t=>{w.value.push({label:`${t.product_name} - ${t.product_count} قطع متاحة`,value:t.id})}),console.log(w.value,"products result"),P.value=!0}).catch(s=>{console.log(s)})},R=()=>{_.value?setTimeout(()=>{location.reload()},500):C("/products")},q=a(),z=a("admin");return O(()=>{K().then(s=>{s==!1?M().then(t=>{t==!1&&(localStorage.removeItem("SwimmingToken"),location.reload(),C({path:"/login",query:S.value.query})),q.value=t.permissions,z.value="employee",F()}):F()})}),(s,t)=>{const i=H("FormKit");return c(),d(I,null,[o(r(L),{visible:f.value,"onUpdate:visible":t[1]||(t[1]=n=>f.value=n),onAfterHide:R,modal:"",header:"بيانات المنتج",style:{width:"50vw"}},{footer:g(()=>[o(r(x),{label:"تم",class:"px-4 py-1",onClick:t[0]||(t[0]=n=>f.value=!1),autofocus:""})]),default:g(()=>[e("div",Q,[e("div",W,[X,e("p",null,m(y.value.product_name),1)]),e("div",Y,[Z,e("p",null,m(y.value.product_count),1)]),e("div",ee,[te,l.value.product_count?(c(),d("p",le,m(l.value.total_price)+" ج.م / "+m(l.value.product_count)+" قطع",1)):(c(),d("p",oe,m(l.value.total_price)+" ج.م / "+m(l.value.count)+" قطع",1))])])]),_:1},8,["visible"]),e("div",se,[e("div",ae,[o(r(J),{modelValue:b.value,"onUpdate:modelValue":t[2]||(t[2]=n=>b.value=n),options:U.value,"aria-labelledby":"basic"},null,8,["modelValue","options"])]),b.value=="منتج جديد"?(c(),d("h1",ne,"تسجيل منتج جديد")):(c(),d("h1",ie,"شراء كمية من منتج موجود")),e("div",ce,[p.value?(c(),$(G,{key:0,class:"fadeinright animation-duration-1000 animation-iteration-1"})):V("",!0),v.value?(c(),d("h5",re,m(h.value),1)):V("",!0)]),b.value=="منتج جديد"?(c(),d("div",ue,[o(i,{type:"form",modelValue:l.value,"onUpdate:modelValue":t[5]||(t[5]=n=>l.value=n),actions:!1,onSubmit:A},{default:g(()=>[e("div",de,[e("div",me,[pe,o(i,{"prefix-icon":"text",id:"name",type:"text",label:"اسم المنتج",placeholder:"أدخل اسم المنتج",name:"product_name",validation:"required|length:2"})]),e("div",ve,[_e,o(i,{"prefix-icon":"dollar",id:"price",type:"number",number:"float",label:"سعر المنتج",placeholder:"أدخل سعر المنتج",name:"product_price",validation:"required|min:0"})]),e("div",fe,[xe,o(i,{"prefix-icon":"dollar",id:"price",type:"number",number:"float",label:"تكلفة المنتج",placeholder:"أدخل تكلفة المنتج",name:"product_cost",validation:"required|min:0"})]),e("div",he,[ye,o(i,{"prefix-icon":"number",id:"count",type:"number",number:"integer",label:"كمية المنتج",placeholder:"أدخل الكمية المتوفرة من المنتج",name:"product_count",validation:"min:0"})]),e("div",be,[ge,o(i,{"prefix-icon":"dollar",id:"totalPrice",type:"number",number:"integer",label:"كمية المنتج",placeholder:"أدخل سعر الشراء النهائي للمنتج",name:"total_price",validation:"min:0"}),o(r(x),{type:"button",label:"احسب سعر الشراء النهائي",onClick:t[3]||(t[3]=n=>B("new"))})])]),e("div",we,[o(r(j),{modelValue:_.value,"onUpdate:modelValue":t[4]||(t[4]=n=>_.value=n)},null,8,["modelValue"]),Ve]),o(r(x),{type:"submit",class:"submitBtn",label:"تسجيل",loading:u.value},null,8,["loading"])]),_:1},8,["modelValue"])])):(c(),d("div",ke,[P.value?(c(),$(i,{key:0,type:"form",modelValue:l.value,"onUpdate:modelValue":t[8]||(t[8]=n=>l.value=n),actions:!1,onSubmit:E},{default:g(()=>[e("div",Ce,[e("div",Pe,[Te,o(i,{type:"dropdown",id:"product",name:"product_id",label:"المنتجات",placeholder:"اختر المنتج الذي تريد شراؤه",options:w.value},null,8,["options"])]),e("div",Be,[Fe,o(i,{"prefix-icon":"number",id:"count",type:"number",number:"integer",label:"كمية المنتج",placeholder:"أدخل الكمية التي تريد شراؤها من المنتج",name:"count",validation:"min:0"})]),e("div",$e,[je,o(i,{"prefix-icon":"dollar",id:"totalPrice",type:"number",number:"integer",label:"كمية المنتج",placeholder:"أدخل سعر الشراء النهائي للمنتج",name:"total_price",validation:"min:0"}),o(r(x),{type:"button",label:"احسب سعر الشراء النهائي",onClick:t[6]||(t[6]=n=>B("exists"))})])]),e("div",Se,[o(r(j),{modelValue:_.value,"onUpdate:modelValue":t[7]||(t[7]=n=>_.value=n)},null,8,["modelValue"]),Ue]),o(r(x),{type:"submit",class:"submitBtn",label:"حفظ",loading:u.value},null,8,["loading"])]),_:1},8,["modelValue"])):V("",!0)]))])],64)}}});export{Ne as default};