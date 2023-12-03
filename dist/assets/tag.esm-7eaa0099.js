import{I as o,a as s,c as t,m as i,H as a,O as l,f as p,T as c,g as u,t as d,J as g}from"./index-54b3e273.js";var m=`
@layer primevue {
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .p-tag-icon,
    .p-tag-value,
    .p-tag-icon.pi {
        line-height: 1.5;
    }
    
    .p-tag.p-tag-rounded {
        border-radius: 10rem;
    }
}
`,v={root:function(r){var n=r.props;return["p-tag p-component",{"p-tag-info":n.severity==="info","p-tag-success":n.severity==="success","p-tag-warning":n.severity==="warning","p-tag-danger":n.severity==="danger","p-tag-rounded":n.rounded}]},icon:"p-tag-icon",value:"p-tag-value"},y=o(m,{name:"tag",manual:!0}),f=y.load,$={name:"BaseTag",extends:g,props:{value:null,severity:null,rounded:Boolean,icon:String},css:{classes:v,loadStyle:f},provide:function(){return{$parentInstance:this}}},S={name:"Tag",extends:$};function B(e,r,n,k,h,T){return s(),t("span",a({class:e.cx("root")},e.ptm("root"),{"data-pc-name":"tag"}),[e.$slots.icon?(s(),i(l(e.$slots.icon),a({key:0,class:e.cx("icon")},e.ptm("icon")),null,16,["class"])):e.icon?(s(),t("span",a({key:1,class:[e.cx("icon"),e.icon]},e.ptm("icon")),null,16)):p("",!0),c(e.$slots,"default",{},function(){return[u("span",a({class:e.cx("value")},e.ptm("value")),d(e.value),17)]})],16)}S.render=B;export{S as s};
