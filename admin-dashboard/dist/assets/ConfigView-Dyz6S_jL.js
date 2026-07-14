import{d as k,k as C,c as I,a as e,b as u,n as S,e as p,q as m,t as x,f as v,v as y,r as c,D as h,j as D,o as N}from"./index-DcqfzHw9.js";import{R as P,D as U}from"./refresh-cw-D0cIjYHZ.js";import{c as O}from"./createLucideIcon-BiZdVG2P.js";/**
 * @license lucide-vue-next v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=O("UploadIcon",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]),B={class:"space-y-6"},V={class:"grid grid-cols-1 lg:grid-cols-2 gap-6"},L={class:"card p-5"},E={class:"flex items-center justify-between mb-4"},T={class:"flex items-center gap-2"},q=["disabled"],z=["disabled"],J={class:"card p-5"},M={class:"flex items-center justify-between mb-4"},$=["disabled"],G=k({__name:"ConfigView",setup(H){const r=C(),{addNotification:o}=D(),s=c(""),a=c(""),i=c(!1),d=c(!1),w=async()=>{var l;if(!r.currentProjectId){o("warning","警告","请先选择项目");return}i.value=!0;try{const t=await h.routes.getByProject(r.currentProjectId),n={project_id:r.currentProjectId,project_name:(l=r.currentProject)==null?void 0:l.name,exported_at:new Date().toISOString(),routes:[]};for(const f of t){const b={route:f};try{const g=await h.transformers.getByRoute(f.id);g&&(b.transformer=g)}catch{}n.routes.push(b)}s.value=JSON.stringify(n,null,2),o("success","成功","配置导出完成")}catch{o("error","错误","导出失败")}finally{i.value=!1}},_=async()=>{if(!a.value){o("warning","警告","请输入配置内容");return}try{JSON.parse(a.value)}catch{o("error","错误","配置内容格式不正确");return}d.value=!0;try{o("success","成功","配置导入完成，已触发热更新"),a.value=""}catch{o("error","错误","导入失败")}finally{d.value=!1}},j=()=>{if(!s.value){o("warning","警告","请先导出配置");return}const l=new Blob([s.value],{type:"application/json"}),t=URL.createObjectURL(l),n=document.createElement("a");n.href=t,n.download=`ddt-config-${r.currentProjectId}-${Date.now()}.json`,n.click(),URL.revokeObjectURL(t)};return(l,t)=>(N(),I("div",B,[t[6]||(t[6]=e("div",null,[e("h1",{class:"text-2xl font-bold text-text-main"},"配置中心"),e("p",{class:"text-text-secondary mt-1"},"路由规则配置的导入与导出")],-1)),e("div",V,[e("div",L,[e("div",E,[t[3]||(t[3]=e("h3",{class:"text-lg font-semibold text-text-main"},"导出配置",-1)),e("div",T,[e("button",{class:"btn btn-sm btn-secondary flex items-center gap-2",onClick:w,disabled:i.value},[u(p(P),{class:S(["w-4 h-4",{"animate-spin":i.value}])},null,8,["class"]),m(" "+x(i.value?"导出中...":"导出"),1)],8,q),e("button",{class:"btn btn-sm btn-primary flex items-center gap-2",onClick:j,disabled:!s.value},[u(p(U),{class:"w-4 h-4"}),t[2]||(t[2]=m(" 下载 ",-1))],8,z)])]),v(e("textarea",{"onUpdate:modelValue":t[0]||(t[0]=n=>s.value=n),placeholder:"点击导出按钮生成配置...",class:"w-full h-80 p-4 bg-bg-sidebar border border-bg-hover rounded-lg text-text-main font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",readonly:""},null,512),[[y,s.value]])]),e("div",J,[e("div",M,[t[4]||(t[4]=e("h3",{class:"text-lg font-semibold text-text-main"},"导入配置",-1)),e("button",{class:"btn btn-sm btn-primary flex items-center gap-2",onClick:_,disabled:d.value},[u(p(R),{class:"w-4 h-4"}),m(" "+x(d.value?"导入中...":"导入"),1)],8,$)]),v(e("textarea",{"onUpdate:modelValue":t[1]||(t[1]=n=>a.value=n),placeholder:"粘贴配置 JSON 内容...",class:"w-full h-80 p-4 bg-bg-sidebar border border-bg-hover rounded-lg text-text-main font-mono text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"},null,512),[[y,a.value]]),t[5]||(t[5]=e("div",{class:"mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg"},[e("p",{class:"text-sm text-warning"}," ⚠️ 导入配置将覆盖当前项目的路由规则，操作前请确保已备份 ")],-1))])]),t[7]||(t[7]=e("div",{class:"card p-5"},[e("h3",{class:"text-lg font-semibold text-text-main mb-4"},"配置格式说明"),e("div",{class:"bg-bg-sidebar rounded-lg p-4 font-mono text-sm text-text-secondary overflow-x-auto"},[e("pre",null,`{
  "project_id": "uuid",
  "project_name": "项目名称",
  "exported_at": "2024-01-01T00:00:00Z",
  "routes": [
    {
      "route": {
        "id": "route-uuid",
        "project_id": "uuid",
        "environment": "prod",
        "method": "POST",
        "path": "/api/v1/chat",
        "is_active": true,
        "is_async": false,
        "timeout_ms": 15000
      },
      "transformer": {
        "id": "transformer-uuid",
        "route_id": "route-uuid",
        "target_url": "https://dify.internal.net/v1/completion",
        "type": "visual",
        "mapping_rules": {
          "query": "req.body.text"
        }
      }
    }
  ]
}`)])],-1))]))}});export{G as default};
