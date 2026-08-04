(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,33525,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},18967,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a={DecodeError:function(){return g},MiddlewareNotFoundError:function(){return C},MissingStaticPage:function(){return v},NormalizeError:function(){return b},PageNotFoundError:function(){return y},SP:function(){return h},ST:function(){return x},WEB_VITALS:function(){return s},execOnce:function(){return i},getDisplayName:function(){return u},getLocationOrigin:function(){return c},getURL:function(){return d},isAbsoluteUrl:function(){return l},isResSent:function(){return p},loadGetInitialProps:function(){return f},normalizeRepeatedSlashes:function(){return m},stringifyError:function(){return j}};for(var o in a)Object.defineProperty(r,o,{enumerable:!0,get:a[o]});let s=["CLS","FCP","FID","INP","LCP","TTFB"];function i(e){let t,r=!1;return(...a)=>(r||(r=!0,t=e(...a)),t)}let n=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,l=e=>n.test(e);function c(){let{protocol:e,hostname:t,port:r}=window.location;return`${e}//${t}${r?":"+r:""}`}function d(){let{href:e}=window.location,t=c();return e.substring(t.length)}function u(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function p(e){return e.finished||e.headersSent}function m(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function f(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await f(t.Component,t.ctx)}:{};let a=await e.getInitialProps(t);if(r&&p(r))return a;if(!a)throw Object.defineProperty(Error(`"${u(e)}.getInitialProps()" should resolve to an object. But found "${a}" instead.`),"__NEXT_ERROR_CODE",{value:"E1025",enumerable:!1,configurable:!0});return a}let h="u">typeof performance,x=h&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class g extends Error{}class b extends Error{}class y extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class v extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class C extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function j(e){return JSON.stringify({message:e.message,stack:e.stack})}},98183,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a={assign:function(){return l},searchParamsToUrlQuery:function(){return s},urlQueryToSearchParams:function(){return n}};for(var o in a)Object.defineProperty(r,o,{enumerable:!0,get:a[o]});function s(e){let t={};for(let[r,a]of e.entries()){let e=t[r];void 0===e?t[r]=a:Array.isArray(e)?e.push(a):t[r]=[e,a]}return t}function i(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function n(e){let t=new URLSearchParams;for(let[r,a]of Object.entries(e))if(Array.isArray(a))for(let e of a)t.append(r,i(e));else t.set(r,i(a));return t}function l(e,...t){for(let r of t){for(let t of r.keys())e.delete(t);for(let[t,a]of r.entries())e.append(t,a)}return e}},96661,5014,e=>{"use strict";let t=(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim();e.s(["mergeClasses",0,t],96661);var r=e.i(71645),a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,r.createContext)({}),s=(0,r.forwardRef)(({color:e,size:s,strokeWidth:i,absoluteStrokeWidth:n,className:l="",children:c,iconNode:d,...u},p)=>{let{size:m=24,strokeWidth:f=2,absoluteStrokeWidth:h=!1,color:x="currentColor",className:g=""}=(0,r.useContext)(o)??{},b=n??h?24*Number(i??f)/Number(s??m):i??f;return(0,r.createElement)("svg",{ref:p,...a,width:s??m??a.width,height:s??m??a.height,stroke:e??x,strokeWidth:b,className:t("lucide",g,l),...!c&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(u)&&{"aria-hidden":"true"},...u},[...d.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(c)?c:[c]])});e.s(["default",0,s],5014)},56420,e=>{"use strict";var t=e.i(71645),r=e.i(96661);let a=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,r)=>r?r.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var o=e.i(5014);e.s(["default",0,(e,s)=>{let i=(0,t.forwardRef)(({className:i,...n},l)=>(0,t.createElement)(o.default,{ref:l,iconNode:s,className:(0,r.mergeClasses)(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...n}));return i.displayName=a(e),i}],56420)},5766,e=>{"use strict";let t,r;var a,o=e.i(71645);let s={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",a="",o="";for(let s in e){let i=e[s];"@"==s[0]?"i"==s[1]?r=s+" "+i+";":a+="f"==s[1]?c(i,s):s+"{"+c(i,"k"==s[1]?"":t)+"}":"object"==typeof i?a+=c(i,t?t.replace(/([^,])+/g,e=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):s):null!=i&&(s="-"==s[1]?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(s,i):s+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+a},d={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e};function p(e){let t,r,a=this||{},o=e.call?e(a.p):e;return((e,t,r,a,o)=>{var s;let p=u(e),m=d[p]||(d[p]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(p));if(!d[m]){let t=p!==e?e:(e=>{let t,r,a=[{}];for(;t=i.exec(e.replace(n,""));)t[4]?a.shift():t[3]?(r=t[3].replace(l," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);d[m]=c(o?{["@keyframes "+m]:t}:t,r?"":"."+m)}let f=r&&d.g;return r&&(d.g=d[m]),s=d[m],f?t.data=t.data.replace(f,s):-1===t.data.indexOf(s)&&(t.data=a?s+t.data:t.data+s),m})(o.unshift?o.raw?(t=[].slice.call(arguments,1),r=a.p,o.reduce((e,a,o)=>{let s=t[o];if(s&&s.call){let e=s(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;s=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==s?"":s)},"")):o.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):o,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||s})(a.target),a.g,a.o,a.k)}p.bind({g:1});let m,f,h,x=p.bind({k:1});function g(e,t){let r=this||{};return function(){let a=arguments;function o(s,i){let n=Object.assign({},s),l=n.className||o.className;r.p=Object.assign({theme:f&&f()},n),r.o=/go\d/.test(l),n.className=p.apply(r,a)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),h&&c[0]&&h(n),m(c,n)}return t?t(o):o}}var b=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),v=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},C="default",j=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},N=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},E={},A=(e,t=C)=>{E[t]=j(E[t]||w,e),N.forEach(([e,r])=>{e===t&&r(E[t])})},k=e=>Object.keys(E).forEach(t=>A(e,t)),T=(e=C)=>t=>{A(t,e)},B={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},P=(e={},t=C)=>{let[r,a]=(0,o.useState)(E[t]||w),s=(0,o.useRef)(E[t]);(0,o.useEffect)(()=>(s.current!==E[t]&&a(E[t]),N.push([t,a]),()=>{let e=N.findIndex(([e])=>e===t);e>-1&&N.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||B[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...r,toasts:i}},O=e=>(t,r)=>{let a,o=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||y()}))(t,e,r);return T(o.toasterId||(a=o.id,Object.keys(E).find(e=>E[e].toasts.some(e=>e.id===a))))({type:2,toast:o}),o.id},$=(e,t)=>O("blank")(e,t);$.error=O("error"),$.success=O("success"),$.loading=O("loading"),$.custom=O("custom"),$.dismiss=(e,t)=>{let r={type:3,toastId:e};t?T(t)(r):k(r)},$.dismissAll=e=>$.dismiss(void 0,e),$.remove=(e,t)=>{let r={type:4,toastId:e};t?T(t)(r):k(r)},$.removeAll=e=>$.remove(void 0,e),$.promise=(e,t,r)=>{let a=$.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?b(t.success,e):void 0;return o?$.success(o,{id:a,...r,...null==r?void 0:r.success}):$.dismiss(a),e}).catch(e=>{let o=t.error?b(t.error,e):void 0;o?$.error(o,{id:a,...r,...null==r?void 0:r.error}):$.dismiss(a)}),e};var F=1e3,D=(e,t="default")=>{let{toasts:r,pausedAt:a}=P(e,t),s=(0,o.useRef)(new Map).current,i=(0,o.useCallback)((e,t=F)=>{if(s.has(e))return;let r=setTimeout(()=>{s.delete(e),n({type:4,toastId:e})},t);s.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),o=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&$.dismiss(r.id);return}return setTimeout(()=>$.dismiss(r.id,t),a)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let n=(0,o.useCallback)(T(t),[t]),l=(0,o.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,o.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),d=(0,o.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:o=8,defaultPosition:s}=t||{},i=r.filter(t=>(t.position||s)===(e.position||s)&&t.height),n=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<n&&e.visible).length;return i.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},I=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,S=x`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,_=x`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,z=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${S} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${_} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,R=x`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,L=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${R} 1s linear infinite;
`,M=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,U=x`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,X=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,H=g("div")`
  position: absolute;
`,W=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Y=x`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Z=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Y} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,q=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(Z,null,t):t:"blank"===r?null:o.createElement(W,null,o.createElement(L,{...a}),"loading"!==r&&o.createElement(H,null,"error"===r?o.createElement(z,{...a}):o.createElement(X,{...a})))},G=g("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,K=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,J=o.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[a,o]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${x(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${x(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(q,{toast:e}),n=o.createElement(K,{...e.ariaProps},b(e.message,e));return o.createElement(G,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:n}):o.createElement(o.Fragment,null,i,n))});a=o.createElement,c.p=void 0,m=a,f=void 0,h=void 0;var Q=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:i,className:t,style:r},s)},V=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;e.s(["CheckmarkIcon",0,X,"ErrorIcon",0,z,"LoaderIcon",0,L,"ToastBar",0,J,"ToastIcon",0,q,"Toaster",0,({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,toasterId:i,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:d}=D(r,i);return o.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(r=>{let i,n,l=r.position||t,c=d.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}),u=(i=l.includes("top"),n=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:v()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${c*(i?1:-1)}px)`,...i?{top:0}:{bottom:0},...n});return o.createElement(Q,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?V:"",style:u},"custom"===r.type?b(r.message,r):s?s(r):o.createElement(J,{toast:r,position:l}))}))},"default",0,$,"resolveValue",0,b,"toast",0,$,"useToaster",0,D,"useToasterStore",0,P],5766)},96315,e=>{"use strict";let t=(0,e.i(56420).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",0,t],96315)},20865,e=>{"use strict";let t=(0,e.i(56420).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",0,t],20865)},75387,e=>{"use strict";let t=(0,e.i(56420).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);e.s(["Phone",0,t],75387)},20818,e=>{"use strict";let t="tharani-branding-settings",r={primaryColor:"#0B3D2E",secondaryColor:"#0D4733",surfaceColor:"#145C3E",surfaceHoverColor:"#1E7D50",pageBackgroundColor:"#0C1A10",elevatedBackgroundColor:"#060E09",borderColor:"#145C3E",strongBorderColor:"#1E7D50",accentColor:"#D4AF37",accentHoverColor:"#E0C050",accentTextColor:"#0B3D2E",majorTextColor:"#FFFFFF",minorTextColor:"#4EC48A",softTextColor:"#72D4A4",mutedTextColor:"#2DAD6E",successColor:"#2DAD6E",infoColor:"#60A5FA",warningColor:"#FACC15",dangerColor:"#F87171",purpleColor:"#C084FC",orangeColor:"#FB923C",neutralColor:"#9CA3AF",logoUrl:"",faviconUrl:"",socialFacebook:"https://facebook.com/aeux",socialInstagram:"https://instagram.com/aeux",socialTwitter:"https://twitter.com/aeux"},a={primaryColor:"--brand-primary",secondaryColor:"--brand-secondary",surfaceColor:"--brand-surface",surfaceHoverColor:"--brand-surface-hover",pageBackgroundColor:"--brand-page-bg",elevatedBackgroundColor:"--brand-elevated-bg",borderColor:"--brand-border",strongBorderColor:"--brand-border-strong",accentColor:"--brand-accent",accentHoverColor:"--brand-accent-hover",accentTextColor:"--brand-accent-text",majorTextColor:"--brand-text-major",minorTextColor:"--brand-text-minor",softTextColor:"--brand-text-soft",mutedTextColor:"--brand-text-muted",successColor:"--brand-success",infoColor:"--brand-info",warningColor:"--brand-warning",dangerColor:"--brand-danger",purpleColor:"--brand-purple",orangeColor:"--brand-orange",neutralColor:"--brand-neutral"};e.s(["BRANDING_STORAGE_KEY",0,t,"DEFAULT_BRANDING_THEME",0,r,"applyBrandingTheme",0,(e=r)=>{if("u"<typeof document)return;let t={...r,...e};Object.entries(a).forEach(([e,r])=>{let a,o;document.documentElement.style.setProperty(r,t[e]),document.documentElement.style.setProperty(`${r}-rgb`,Number.isNaN(o=Number.parseInt(3===(a=t[e].replace("#","").trim()).length?a.split("").map(e=>`${e}${e}`).join(""):a,16))?"255 255 255":`${o>>16&255} ${o>>8&255} ${255&o}`)})},"getSavedBrandingTheme",0,()=>{try{let e=JSON.parse(localStorage.getItem(t)||"null");return e?{...r,...e}:r}catch{return r}}])},10494,e=>{"use strict";var t=e.i(71645),r=e.i(20818);e.s(["default",0,function(){return(0,t.useEffect)(()=>{(0,r.applyBrandingTheme)((0,r.getSavedBrandingTheme)())},[]),null}])},89064,e=>{"use strict";var t=e.i(43476),r=e.i(20865),a=e.i(75387),o=e.i(96315),s=e.i(84828);e.s(["default",0,function(){return(0,t.jsxs)("footer",{className:"bg-[#00361F] text-[#F6ECD0]",children:[(0,t.jsx)("img",{src:"/assets/footer-top.png",alt:"",className:"block w-full select-none"}),(0,t.jsx)("div",{className:"max-w-[1420px] mx-auto px-10 py-16",children:(0,t.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr] gap-16",children:[(0,t.jsx)("div",{className:"flex justify-center",children:(0,t.jsxs)("div",{className:"w-64 text-center",children:[(0,t.jsx)("img",{src:"/assets/logo.png",alt:"Tharani Textiles",className:"w-full"}),(0,t.jsxs)("p",{className:"mt-8 text-center font-sans text-[15px] leading-8 text-[#F6ECD0]",children:["Timeless Craftsmanship",(0,t.jsx)("br",{}),"Since 1995"]})]})}),(0,t.jsxs)("div",{className:"relative pl-10",children:[(0,t.jsx)("div",{className:"absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25"}),(0,t.jsx)("h3",{className:"font-cormorant text-[24px] text-[#C79A2B] mb-7",children:"SITE LINKS"}),(0,t.jsxs)("ul",{className:"space-y-4 font-sans text-[15px]",children:[(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"/",className:"hover:text-[#C79A2B] transition-colors",children:"Home"})}),(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"/cart",className:"hover:text-[#C79A2B] transition-colors",children:"Your Cart"})}),(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"/wishlist",className:"hover:text-[#C79A2B] transition-colors",children:"Wishlist"})}),(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"/account",className:"hover:text-[#C79A2B] transition-colors",children:"Your Account"})})]})]}),(0,t.jsxs)("div",{className:"relative pl-10",children:[(0,t.jsx)("div",{className:"absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25"}),(0,t.jsx)("h3",{className:"font-cormorant text-[24px] text-[#C79A2B] mb-7",children:"CUSTOMER CARE"}),(0,t.jsxs)("ul",{className:"space-y-4 font-sans text-[15px]",children:[(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"#",className:"hover:text-[#C79A2B] transition-colors",children:"Terms & Conditions"})}),(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"#",className:"hover:text-[#C79A2B] transition-colors",children:"Privacy Policy"})}),(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"#",className:"hover:text-[#C79A2B] transition-colors",children:"Shipping Policy"})}),(0,t.jsx)("li",{children:(0,t.jsx)("a",{href:"#",className:"hover:text-[#C79A2B] transition-colors",children:"Return & Refund Policy"})})]})]}),(0,t.jsxs)("div",{className:"relative pl-10",children:[(0,t.jsx)("div",{className:"absolute left-0 top-2 bottom-2 w-px bg-[#C79A2B]/25"}),(0,t.jsx)("h3",{className:"font-cormorant text-[24px] text-[#C79A2B] mb-7",children:"CONTACT"}),(0,t.jsxs)("div",{className:"space-y-5 font-sans text-[15px] text-[#F6ECD0]",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)(r.MapPin,{size:18,className:"mt-1 shrink-0 text-[#C79A2B]"}),(0,t.jsxs)("span",{children:["Elampillai,",(0,t.jsx)("br",{}),"Tamil Nadu"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)(a.Phone,{size:18,className:"shrink-0 text-[#C79A2B]"}),(0,t.jsx)("span",{children:"+91 XXXXX XXXXX"})]}),(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)(o.Mail,{size:18,className:"shrink-0 text-[#C79A2B]"}),(0,t.jsx)("span",{children:"info@tharanitextiles.com"})]}),(0,t.jsxs)("div",{className:"flex gap-6 pt-5 text-[22px] text-[#C79A2B]",children:[(0,t.jsx)("a",{href:"#",className:"transition hover:scale-110 hover:text-white",children:(0,t.jsx)(s.FaInstagram,{})}),(0,t.jsx)("a",{href:"#",className:"transition hover:scale-110 hover:text-white",children:(0,t.jsx)(s.FaFacebookF,{})}),(0,t.jsx)("a",{href:"#",className:"transition hover:scale-110 hover:text-white",children:(0,t.jsx)(s.FaXTwitter,{})}),(0,t.jsx)("a",{href:"#",className:"transition hover:scale-110 hover:text-white",children:(0,t.jsx)(s.FaYoutube,{})})]})]})]})]})}),(0,t.jsx)("img",{src:"/assets/footer-bottom.png",alt:"",className:"block w-full select-none"})]})}])}]);