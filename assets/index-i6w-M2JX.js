var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},ee=Object.prototype.hasOwnProperty;function te(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function ne(e,t){return te(e.type,t,e.props)}function T(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function E(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var D=/\/+/g;function re(e,t){return typeof e==`object`&&e&&e.key!=null?E(``+e.key):t.toString(36)}function O(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function ie(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,ie(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+re(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(D,`$&/`)+`/`),ie(o,r,i,``,function(e){return e})):o!=null&&(T(o)&&(o=ne(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(D,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+re(a,u),c+=ie(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+re(a,u++),c+=ie(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return ie(O(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function ae(e,t,n){if(e==null)return e;var r=[],i=0;return ie(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function oe(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var k=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},A={map:ae,forEach:function(e,t,n){ae(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return ae(e,function(){t++}),t},toArray:function(e){return ae(e,function(e){return e})||[]},only:function(e){if(!T(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=A,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!ee.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return te(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)ee.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return te(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=T,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:oe}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,k)}catch(e){k(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.6`})),u=o(((e,t)=>{t.exports=l()})),d=o((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m)if(n(c)!==null)m=!0,S||(S=!0,T());else{var t=n(l);t!==null&&re(x,t.startTime-e)}}var S=!1,C=-1,w=5,ee=-1;function te(){return g?!0:!(e.unstable_now()-ee<w)}function ne(){if(g=!1,S){var t=e.unstable_now();ee=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&te());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&re(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?T():S=!1}}}var T;if(typeof y==`function`)T=function(){y(ne)};else if(typeof MessageChannel<`u`){var E=new MessageChannel,D=E.port2;E.port1.onmessage=ne,T=function(){D.postMessage(null)}}else T=function(){_(ne,0)};function re(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):w=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,re(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,T()))),r},e.unstable_shouldYield=te,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),f=o(((e,t)=>{t.exports=d()})),p=o((e=>{var t=u();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`)if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void×O=ï‹h‘éì¶»§q«^vŠ
_JNÝ˜\ˆXÛ\ÜÈ^[™È^×Ü\œÙJJ^ÚYŠ\Ë—ÙÙ]\JJHOOX‹›˜[Š^Û]]\Ë—ÙÙ]Ü”™]\›Ý
JNÜ™]\›ˆ
ØÛÙN”Ëš[˜[YÝ\K^XÝY˜‹›˜[‹™XÙZ]™Yœ\œÙY\_JK\™]\›žÜÝ]\Î˜˜[Y˜[YN™K™]___NÙ˜Ü™X]OYOO›™]È
Ý\S˜[YN”‹–›Ù˜S‹‹‹šŠJ_JNÝ˜\ˆXÛ\ÜÈ^[™È^×Ü\œÙJJ^Û]ØÝO]\Ë—Ü›ØÙ\ÜÒ[œ]\˜[\ÊJK]™]NÜ™]\›ˆ\Ë—ÙY‹\K—Ü\œÙJÙ]N›‹]œ]\™[J_][Ü˜\

^Ü™]\›ˆ\Ë—ÙY‹\__KXÛ\ÜÈH^[™È^×Ü\œÙJJ^Û]ÜÝ]\ÎÝ›ŸO]\Ë—Ü›ØÙ\ÜÒ[œ]\˜[\ÊJNÚYŠ‹˜ÛÛ[[Û‹˜\Þ[˜Ê\™]\›Š\Þ[˜Ê
OOžÛ]OX]ØZ]\Ë—ÙY‹š[‹—Ü\œÙP\Þ[˜ÊÙ]N›‹™]K]›‹œ]\™[›ŸJNÜ™]\›ˆKœÝ]\ÏOOXX›ÜYÑ™KœÝ]\ÏOOX\XÊ™\J
K™JK˜[YJJN\Ë—ÙY‹›Ý]—Ü\œÙP\Þ[˜ÊÙ]N™K˜[YK]›‹œ]\™[›ŸJ_JJ
NÞÛ]O]\Ë—ÙY‹š[‹—Ü\œÙTÞ[˜ÊÙ]N›‹™]K]›‹œ]\™[›ŸJNÜ™]\›ˆKœÝ]\ÏOOXX›ÜYÑ™KœÝ]\ÏOOX\XÊ™\J
KÜÝ]\Î˜\X˜[YN™K˜[Y_JN\Ë—ÙY‹›Ý]—Ü\œÙTÞ[˜ÊÙ]N™K˜[YK]›‹œ]\™[›ŸJ__\Ý]XÈÜ™X]JŠ^Ü™]\›ˆ™]ÈJÚ[ŽÝ]›‹\S˜[YN”‹–›Ù\[[™_J__K]XÛ\ÜÈ^[™È^×Ü\œÙJJ^Û]]\Ë—ÙY‹š[›™\•\K—Ü\œÙJJKYOOŠÙJJI‰ŠK˜[YOSØš™XÝ™œ™Y^™JK˜[YJJKJNÜ™]\›ˆÊ
OÝ[ŠOO›ŠJJN›Š
_][Ü˜\

^Ü™]\›ˆ\Ë—ÙY‹š[›™\•\__NÛ]˜Ü™X]OJK
OO›™]È]
Ú[›™\•\N™K\S˜[YN”‹–›Ù™XYÛ›K‹‹šŠ
_JKÙK›^žXÜ™X]NÝ˜\ˆŽÊ[˜Ý[ÛŠJ^ÙK–›ÙÝš[™ÏX›ÙÝš[™ØK–›Ù[X™\X›Ù[X™\˜K–›Ù˜SX›Ù˜S˜K–›ÙšYÒ[X›ÙšYÒ[K–›Ù›ÛÛX[X›Ù›ÛÛX[˜K–›Ù]OX›Ù]XK–›ÙÞ[X›ÛX›ÙÞ[X›ÛK–›Ù[™Yš[™YX›Ù[™Yš[™YK–›Ù[X›Ù[K–›Ù[žOX›Ù[žXK–›Ù[šÛ›ÝÛX›Ù[šÛ›ÝÛ˜K–›Ù™]™\X›Ù™]™\˜K–›Ù›ÚYX›Ù›ÚYK–›Ù\œ˜^OX›Ù\œ˜^XK–›ÙØš™XÝX›ÙØš™XÝK–›Ù[š[ÛX›Ù[š[Û˜K–›Ù\ØÜš[Z[˜]Y[š[ÛX›Ù\ØÜš[Z[˜]Y[š[Û˜K–›Ù[\œÙXÝ[ÛX›Ù[\œÙXÝ[Û˜K–›Ù\OX›Ù\XK–›Ù™XÛÜ™X›Ù™XÛÜ™K–›ÙX\X›ÙX\K–›ÙÙ]X›ÙÙ]K–›Ù[˜Ý[ÛX›Ù[˜Ý[Û˜K–›Ù^žOX›Ù^žXK–›Ù]\˜[X›Ù]\˜[K–›Ù[[OX›Ù[[XK–›ÙY™™XÝÏX›ÙY™™XÝØK–›Ù˜]]™Q[[OX›Ù˜]]™Q[[XK–›ÙÜ[Û˜[X›ÙÜ[Û˜[K–›Ù[X›OX›Ù[X›XK–›ÙY˜][X›ÙY˜][K–›ÙØ]ÚX›ÙØ]ÚK–›Ù›ÛZ\ÙOX›Ù›ÛZ\ÙXK–›Ùœ˜[™YX›Ùœ˜[™YK–›Ù\[[™OX›Ù\[[™XK–›Ù™XYÛ›OX›Ù™XYÛ›XJJŸ^ßJNÝ˜\ˆZ™K˜Ü™X]KÝS™K˜Ü™X]NÙ˜Ü™X]KK˜Ü™X]NÝ˜\ˆÝQ™K˜Ü™X]NÒYK˜Ü™X]KK˜Ü™X]K™K˜Ü™X]K™K˜Ü™X]K™K˜Ü™X]K™K˜Ü™X]KK˜Ü™X]KYK˜Ü™X]NÝ˜\ˆUÙK˜Ü™X]KRÙK˜Ü™X]NÒÙKœÝšXÝÜ™X]KYK˜Ü™X]KYK˜Ü™X]K™K˜Ü™X]KYK˜Ü™X]K	K˜Ü™X]K]˜Ü™X]K˜Ü™X]K˜Ü™X]K˜Ü™X]NÝ˜\ˆ]Z]˜Ü™X]K[Ý˜Ü™X]NÑ‹˜Ü™X]KÝ˜Ü™X]KÝ˜Ü™X]KK˜Ü™X]K˜Ü™X]KÝ˜Ü™X]UÚ]™\›ØÙ\ÜË˜Ü™X]NÝ˜\ˆ[Ê
OOžÝ˜\ˆTÞ[X›Û™›ÜŠ™XXÝ˜[œÚ][Û˜[™[[Y[
KTÞ[X›Û™›ÜŠ™XXÝ™œ˜YÛY[
NÙ[˜Ý[ÛˆŠK‹Š^Ý˜\ˆO[[ÚYŠˆOO]›ÚY	‰ŠOX
ÜŠK‹šÙ^HOO]›ÚY	‰ŠOX
Û‹šÙ^JKÙ^X[ˆŠY›ÜŠ˜\ˆH[ˆ^ßKŠXHOOXÙ^X	‰Š–ØWO[–ØWJNÙ[ÙH[ŽÜ™]\›ˆ\‹œ™Y‹É	\[ÙŽ\N™KÙ^NšK™YŽ›OO]›ÚYÛ[›‹›ÜÎœŸ_YK‘œ˜YÛY[[‹KšœÞ\‹KšœÞÏ\ŸJJKÝ[Ê

K
OOžÝ™^ÜÏ^

_JJKÝYÊ
KÝ]J
KXÊÊ
KJKTÝ

K]^ŠÝ™\œÚ[ÛŽž]
JK^ÜY]š

KÙ][™ÜÎžŠÙÜšY™Ý

_JKÜ›Ý\Î
ŠÚYš

K˜[YNš

KÛÛÜŽš

KØÚÙY—Ý

_JJKÚYÙ]Î
ŠÚYš

K\N˜
Ø›ÛÚÛX\šØ›ÝXÙØJK]Nš

K^[Ý]žŠÞ™Ý

KN™Ý

KÚY™Ý

KZYÚ™Ý

K’[™^™Ý

_JKÜ›Ý\Yš

K›[X›J
KØÚÙY—Ý

K]NžŠÝ\›š

K›Ü[Û˜[

K›ÙNš

K›Ü[Û˜[

KÛ™N—Ý

K›Ü[Û˜[

KYNš

K›Ü[Û˜[

Kš[Üš]Nš

K›Ü[Û˜[

_JKÜ™X]Y]š

K\]Y]š

_JJ_JKJ
OO›™]È]J
KÒTÓÔÝš[™Ê
KÝJK‹‹JOOŠÚY˜Üž\Ëœ˜[™ÛUURQ

K\N™K]N]NšKÜ›Ý\Y›[ØÚÙYˆLK^[Ý]žÞ›‹Nœ‹ÚY™OOOX›ÝXÌÌŒŒŽZYÚ™OOOX›ÝXÌŒÌŒNL’[™^Œ_KÜ™X]Y]‘

K\]Y]‘

_JKÝ^Ý™\œÚ[ÛŽŒK^ÜY]‘

KÙ][™ÜÎžÙÜšYŒŒKÜ›Ý\Î–ÞÚY˜ËZ˜]˜X˜[YN˜UXÛÛÜŽ˜Ù™˜ŽØÚÙYˆL_KÚY˜ËX[ÛØ˜[YN˜SÓÔ’UXÛÛÜŽ˜ÎYØÙ™˜ØÚÙYˆL_WKÚYÙ]Î–ÞË‹‹“Ý
›ÛÚÛX\šØÔÐQ–HÒUP˜Ý\›˜Î‹ËÛX‹œÜØYžK˜ÛÛXJKÜ›Ý\Y˜ËZ˜]˜XKË‹‹“Ý
ÙØ;&):â¦;'f;ef{"­XÍŒÙÛ™NˆLKYN›™]È]J
KÒTÓÔÝš[™Ê
KœÛXÙJL
Kš[Üš]N˜QÒJKÜ›Ý\Y˜ËZ˜]˜XKË‹‹“Ý
›ÝX;%c:¬è:é«;)¦:êe:êªÌØ›ÙN˜‘”Îˆ;`d;%ä:á(û'a:åc:ì*zë.;,¦:é«»"ç:¬!:ìí{'¨zãáÊˆ
ÈJXJKÜ›Ý\Y˜ËX[ÛØKË‹‹“Ý
›ÛÚÛX\šØÕÈVT•PÐQSVXÎLÌÝ\›˜Î‹ËÜÝÙ^\XØY[^K˜ÛÛXJKÜ›Ý\Y˜ËX[ÛØW_NÙ[˜Ý[Ûˆ]
Ý\N™_J^Ü™]\›Š‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜Ú[™Ú[™IÙ_XÚ[™[Ž™OOOX›ÛÚÛX\šØØ8¡¥Ø™OOOX›ÝXØ8¢hX˜8§$ØJ_Y[˜Ý[Ûˆ

^Û]ÙKOJÝ\ÙTÝ]JJ

OOžÚYŠ\[ÙˆÚ[™ÝÏ˜X
\™]\›ˆÝÝž^Û]O[ØØ[ÝÜ˜YÙK™Ù]][JÜØYžKY\Ú›Ø\™]ŒX
NÜ™]\›ˆOÑ]œ\œÙJ”ÓÓ‹œ\œÙJJJNšÝXØ]ÚÜ™]\›ˆÝ_JKÛ‹—OJÝ\ÙTÝ]JJLJKÚKWOJÝ\ÙTÝ]JJ[
KÛË×OJÝ\ÙTÝ]JJLJKØËOJÝ\ÙTÝ]JJ×JKÝKOJÝ\ÙTÝ]JJ
KJÝ\ÙT™YŠJ[
KJÝ\ÙT™YŠJ[
NÊÝ\ÙQY™™XÝ
J

OOžÛØØ[ÝÜ˜YÙKœÙ]][JÜØYžKY\Ú›Ø\™]ŒX”ÓÓ‹œÝš[™ÚYžJË‹‹™K^ÜY]‘

_JJ_KÙWJK
Ý\ÙQY™™XÝ
J

OOžÚYŠ]J\™]\›ŽÛ]O\Ù][Y[Ý]


OO™

KŽ
NÜ™]\›Š
OO˜ÛX\•[Y[Ý]
J_KÝWJNÛ]OJKŠOO
OŠË‹‹ÚYÙ]ÎÚYÙ]Ë›X\
OšYOOYOÞË‹‹‹‹›‹\]Y]‘

_N
_JJKJKŠOO
OŠË‹‹ÚYÙ]ÎÚYÙ]Ë›X\
OšYOOYOÞË‹‹^[Ý]žË‹‹›^[Ý]‹‹›ŸK\]Y]‘

_N
_JJNÊÝ\ÙQY™™XÝ
J

OOžÚYŠ[ŸY‹˜Ý\œ™[
\™]\›ŽÛ]YKœÙ][™ÜË™ÜšYÜ™]\›Š™Y˜][
JÚYÙ]››Ý
›ØÚÙY
X
K™˜YÙØX›JØ[ÝÑœ›ÛN˜™˜YËZ[™X[ÙYšY\œÎ–Õ™Y˜][›[ÙYšY\œËœÛ˜\
Ý\™Ù]Î–Õ™Y˜][œÛ˜\\œË™ÜšY
ÞNJWK˜[™ÙNŒKÌJWK\Ý[™\œÎžÛ[Ý™J
^Û]]\™Ù]™]\Ù]šYYKÚYÙ]Ë™š[™
OO™KšYOO[ŠNÜ‰‰š
‹Þœ‹›^[Ý]ž
Ý™N“X]›X^
‹›^[Ý]žJÝ™J_J___JKœ™\Ú^˜X›JÙYÙ\ÎžÛYˆLKšYÚˆL›ÝÛNˆLÜˆL_K[ÙYšY\œÎ–Õ™Y˜][›[ÙYšY\œËœÛ˜\Ú^™JÝ\™Ù]Î–Õ™Y˜][œÛ˜\\œË™ÜšY
ÞNJW_JK™Y˜][›[ÙYšY\œËœ™\ÝšXÝÚ^™JÛZ[ŽžÝÚYŒZYÚŒML_JWK\Ý[™\œÎžÛ[Ý™JJ^Ú
K\™Ù]™]\Ù]šYÝÚY™Kœ™XÝÚYZYÚ™Kœ™XÝšZYÚJ___JK

OOŠ™Y˜][
JÚYÙ]
K[œÙ]

_KÛ‹KœÙ][™ÜË™ÜšYKÚYÙ]×JNÛ]ÏJÝ\ÙSY[[ÊJ

OOŠÝÙÎ™KÚYÙ]Ë™š[\ŠOO™K\OOOXÙØ	‰ˆYK™]K™Û™JK›[™Ý›ÛÚÛX\šÎ™KÚYÙ]Ë™š[\ŠOO™K\OOOX›ÛÚÛX\šØ
K›[™ÝÜ›Ý\™K™Ü›Ý\Ë›[™ÝJKÙWJKÏYOOžÙKœ™]™[Y˜][

NÛ][™]È›Ü›Q]JK˜Ý\œ™[\™Ù]
KZKÏTÝš[™Ê‹™Ù]
]X
_; â;'!;(+Ø
KÏ\OOX›ÛÚÛX\šØÞÝ\›”Ýš[™Ê‹™Ù]
ÛÛ[
_Î‹ËØ
_NœOOX›ÝXÞØ›ÙN”Ýš[™Ê‹™Ù]
ÛÛ[
_
_NžÙÛ™NˆLKYN”Ýš[™Ê‹™Ù]
YX
_
Kš[Üš]N”Ýš[™Ê‹™Ù]
š[Üš]X
_QQUSX
_NÝ
OOŠË‹‹™KÚYÙ]Î–Ë‹‹™KÚYÙ]ËÝ
‹Ë
ÙKÚYÙ]Ë›[™Ý	M

ÙKÚYÙ]Ë›[™Ý	MJÊW_JJKJ[
K
;'!;(+û'a;-¥:¬ ;e¢;"­zââ:âé˜
_K[OžØÛÛ™š\›J;'m;'!;(+û'a; «{(';eh:®c;&¥Ø
I‰ŠKÚYÙ]Ë™š[™
OO™KšYOO[ŠK
OOŠË‹‹™KÚYÙ]Î™KÚYÙ]Ë™š[\ŠOO™KšYOO[Š_JJK
; «{(';e¢;"­zââ:âéˆ:ä&:ãã:é«:è):êmÝ›
Öˆ:ã ;"è:ì,{%á{'a;fg;&ª{em;(ï;!.;&¥˜
J_KOJ
OOžÛ][™]È›ØŠÒ”ÓÓ‹œÝš[™ÚYžJË‹‹™K^ÜY]‘

_K[ŠWKÝ\N˜\XØ][Û‹ÚœÛÛ˜JKYØÝ[Y[˜Ü™X]Q[[Y[
X
NÛ‹š™YUT“˜Ü™X]SØš™XÝT“

K‹™ÝÛ›ØYXÜØYžKY\Ú›Ø\™IÛ™]È]J
KÒTÓÔÝš[™Ê
KœÛXÙJL
_KšœÛÛ˜‹˜ÛXÚÊ
KT“œ™]›ÚÙSØš™XÝT“
‹š™YŠ_KX\Þ[˜ÈOOžÚYŠJ]ž^Û]Q]œ\œÙJ”ÓÓ‹œ\œÙJ]ØZ]K^

JJNÚYŠXÛÛ™š\›J;f!;'«:ãl;'m;a,:éo:ì,{%áH;c#;'o:à­;&ª{'/:èg:­d;,­;eh:®c;&¥Ø
J\™]\›ŽÝ
ŠK
;&ã;`k;"©;c¦;'m;"©:éo:ìí{&ä;e¢;"­zââ:âé˜
_XØ]ÚÙ
;'(;fª;ef;)à;%b»'`:ì,{%áH;c#;'o;'¡zââ:âéˆ:®,;(m:ãl;'m;a,:â¥;'(;)à:ä*zââ:âé˜
__NÜ™]\›Š‹šœÞÊJXZ[˜ØÚ[™[Ž–Ê‹šœÞÊJXY\˜ØÛ\ÜÓ˜[YN˜Ü˜\˜Ú[™[Ž–Ê‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜œ˜[™Ú[™[Ž–Ê‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜›Û\Ú[™[Ž˜—ØJK
‹šœÞÊJ]˜ØÚ[™[Ž–Ê‹šœÞÊJÝ›Û™ØØÚ[™[Ž–ØÔÐQ–H
‹šœÞ
J[XØÚ[™[Ž˜TÒ“ÐT‘JW_JK
‹šœÞ
JÛX[ØÚ[™[Ž˜T”ÓÓSUˆÓÔ’ÔÔPÑXJW_JW_JK
‹šœÞÊJ˜]˜È˜\šXK[X™[Ž˜;&ã;`k;"©;c¦;'m;"©:ãá:­kÚ[™[Ž–Ê‹šœÞ
J]Û˜ØÛ\ÜÓ˜[YN˜ÚÜÝÛÛXÚÎžKÚ[™[Ž˜8¡¤ÈVÔ•JK
‹šœÞ
J]Û˜ØÛ\ÜÓ˜[YN˜ÚÜÝÛÛXÚÎŠ
OOœ˜Ý\œ™[Ë˜ÛXÚÊ
KÚ[™[Ž˜8¡¤HSTÔ•JK
‹šœÞ
J[œ]Ü™YŽœY[ŽˆL\N˜š[XXØÙ\˜\XØ][Û‹ÚœÛÛ˜ÛÚ[™ÙN™OO˜ŠK\™Ù]™š[\ÏË–ÌJ_JK
‹šœÞ
J]Û˜ØÛ\ÜÓ˜[YN›Ø[ÙHXÝ]™X˜[ÙXÛÛXÚÎŠ
OOžÜŠOOˆYJKÊLJ_KÚ[™[Ž›Ø8¥ãÈQUSÑX˜8¥âÈ’QUÈSÑXJW_JW_JK
‹šœÞÊJÙXÝ[Û˜ØÛ\ÜÓ˜[YN˜ÛÛ[X[™˜\˜Ú[™[Ž–Ê‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜Ý]\ØÚ[™[Ž–Ê‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜Û›[™XJKÖTÕSHÓ“S‘H
‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜Û\ÚÚ[™[Ž˜ËØJK
‹šœÞ
J˜ØÚ[™[Ž™KÚYÙ]Ë›[™ÝJKÒQÑUÈ
‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜Û\ÚÚ[™[Ž˜ËØJKUUËTÐU‘Q_JK
‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜XÝ[ÛœØÚ[™[Ž–Ê‹šœÞ
J]Û˜ÛÛÛXÚÎŠ
OO˜J›ÛÚÛX\šØ
KÚ[™[Ž˜
È“ÓÒÓPT’ØJK
‹šœÞ
J]Û˜ÛÛÛXÚÎŠ
OO˜J›ÝX
KÚ[™[Ž˜
È“ÕXJK
‹šœÞ
J]Û˜ÛÛÛXÚÎŠ
OO˜JÙØ
KÚ[™[Ž˜
ÈÑØJK‰‰Š‹šœÞ
J]Û˜ØÛ\ÜÓ˜[YN˜Ü›Ý\ÛÛXÚÎŠ
OOœÊOOˆYJKÚ[™[Ž˜8¥áÈÔ“ÕTJW_JW_JK
‹šœÞÊJÙXÝ[Û˜ØÛ\ÜÓ˜[YN˜Ý]Ø˜\šXK[X™[Ž˜;&¥;%oXÚ[™[Ž–Ê‹šœÞÊJ\XÛXØÚ[™[Ž–Ê‹šœÞ
JÜ[˜ØÚ[™[Ž˜ÔSˆTÒÔØJK
‹šœÞ
J˜ØÚ[™[Ž”Ýš[™ÊËÙÊKœYÝ\
‹
_JK
‹šœÞ
JXØÚ[™[Ž˜“ÐÕTØJW_JK
‹šœÞÊJ\XÛXØÚ[™[Ž–Ê‹šœÞ
JÜ[˜ØÚ[™[Ž˜“ÓÒÓPT’ÔØJK
‹šœÞ
J˜ØÚ[™[Ž”Ýš[™ÊË˜›ÛÚÛX\šÊKœYÝ\
‹
_JK
‹šœÞ
JXØÚ[™[Ž˜S’ÔØJW_JK
‹šœÞÊJ\XÛXØÚ[™[Ž–Ê‹šœÞ
JÜ[˜ØÚ[™[Ž˜Ô“ÕTØJK
‹šœÞ
J˜ØÚ[™[Ž”Ýš[™ÊË™Ü›Ý\
KœYÝ\
‹
_JK
‹šœÞ
JXØÚ[™[Ž˜ÔPÔØJW_JK
‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜][ÝXÚ[™[Ž–Ê‹šœÞ
JÜ[˜ØÚ[™[Ž˜ÑVIÔÈÑØJK
‹šœÞ
JØÚ[™[Ž˜8 ':¯®;) ;ej;'m:¬¬:­kH;"é:è){'a:éã:äè:âé¸ 'XJK
‹šœÞ
JÛX[ØÚ[™[Ž›™]È[‘]U[YQ›Ü›X]
ÛËRÔ˜Ù]TÝ[N˜[JK™›Ü›X]
™]È]J_JW_JW_JKÉ‰Š‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜Ù[XÝ[Û˜˜\˜Ú[™[Ž–Ê‹šœÞÊJÜ[˜ØÚ[™[Ž–Ø:­î:èî{fe;eh;'!;(+È;!(;`çH0­ÈË›[™Ý:¬';!(;`çX_JK
‹šœÞ
J]Û˜ÛÛÛXÚÎŠ
OOžÚYŠË›[™ÝJ\™]\›ˆ
:­î:èî{'/:èg:ë-»'a;'!;(+û'a;!(;`ç{em;(ï;!.;&¥˜
NÛ]O\›Û\
:­î:èîH;'m:é¡‘UÈÔ“ÕT
NÚYŠYJ\™]\›ŽÛ]XÜž\Ëœ˜[™ÛUURQ

NÝ
OŠË‹‹Ü›Ý\Î–Ë‹‹™Ü›Ý\ËÚY›‹˜[YN™KÛÛÜŽ˜ÍM™˜ŒØÚÙYˆL_WKÚYÙ]ÎÚYÙ]Ë›X\
OO˜Ëš[˜ÛY\ÊKšY
OÞË‹‹™KÜ›Ý\Y›ŸN™J_JJK
×JKÊLJK
; â:­î:èî{'a:éã:äé;%â;"­zââ:âé˜
_KÚ[™[Ž˜:­î:èîH:éã:äé:®,JK
‹šœÞ
J]Û˜ÛÛÛXÚÎŠ
OOžÜÊLJK
×J_KÚ[™[Ž˜;-ê;!£JW_JK
‹šœÞÊJÙXÝ[Û˜ØÛ\ÜÓ˜[YN˜Ø[˜\Ë]Ü˜\Ú[™[Ž–Ê‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜Ø[˜\Ë[X™[Ú[™[Ž–Ê‹šœÞ
JÜ[˜ØÚ[™[Ž˜ÓÔ’ÔÔPÑHÈPRS˜JK
‹šœÞ
JÛX[ØÚ[™[Ž›Ø:äç:ç¦:­î;en:äé:¬ï;&¬;.(H;ef:âê;'/:èg;'m:ãæp­û`k:®,;(l;("˜:ìí:®,:êª:äç0­È;/f;ad;.(:éo:ì%:èg; «;&ª{ef;!.;&¥JW_JK
‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜Ø[˜\Ø™YŽ™‹Ý[NžÚZYÚ“X]›X^
L‹‹™KÚYÙ]Ë›X\
OO™K›^[Ý]žJÙK›^[Ý]šZYÚ
Î
J_KÚ[™[Ž–ÙK™Ü›Ý\Ë›X\
OŠ‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜Ü›Ý\XÚ\Ý[NžØ›Ü™\ÛÛÜŽ˜ÛÛÜ‹ÛÛÜŽ˜ÛÛÜŸKÚ[™[Ž–Ý›˜[YK
‹šœÞ
JÜ[˜ØÚ[™[Ž™KÚYÙ]Ë™š[\ŠOO™K™Ü›Ý\YOO]šY
K›[™ÝJW_KšY
JKKÚYÙ]Ë›X\
OŠ‹šœÞÊJ\XÛXÈ™]KZYŽœ‹šYÛ\ÜÓ˜[YN˜ÚYÙ]	Ü‹›ØÚÙYØØÚÙY˜H	ØËš[˜ÛY\Ê‹šY
OØÙ[XÝY˜XÝ[NžÝ˜[œÙ›Ü›N˜˜[œÛ]J	Ü‹›^[Ý]ž\	Ü‹›^[Ý]ž_\
XÚYœ‹›^[Ý]ÚYZYÚœ‹›^[Ý]šZYÚ’[™^œ‹›^[Ý]ž’[™^KÛÛXÚÎŠ
OO›É‰›
OO™Kš[˜ÛY\Ê‹šY
OÙK™š[\ŠOO™HOO\‹šY
N–Ë‹‹™K‹šYJKÚ[™[Ž–Ê‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜ÚYÙ]]Ü˜YËZ[™XÚ[™[Ž–Ê‹šœÞ
J]Ý\Nœ‹\_JK
‹šœÞ
JÜ[˜ØÚ[™[Žœ‹\KÕ\\Ø\ÙJ
_JK‹™Ü›Ý\Y	‰Š‹šœÞ
JÛX[ØÚ[™[Ž™K™Ü›Ý\Ë™š[™
OO™KšYOO\‹™Ü›Ý\Y
OË›˜[Y_JK
‹šœÞ
J]˜ØÛ\ÜÓ˜[YN˜ÚYÙ]]ÛÛØÚ[™[Ž›‰‰Š‹šœÞÊJ‹‘œ˜YÛY[ØÚ[™[Ž–Ê‹šœÞ
J]Û˜È˜\šXK[X™[Ž˜;'¨:®"Û”Ú[\‘ÝÛŽ™OO™KœÝÜ›ÜYØ][ÛŠ
KÛÛXÚÎŠ
OO›J‹šYÛØÚÙYˆ\‹›ØÚÙYJKÚ[™[Žœ‹›ØÚÙYØ8¥á˜˜8¥áØJK
‹šœÞ
J]Û˜È˜\šXK[X™[Ž˜:ìí{('Û”Ú[\‘ÝÛŽ™OO™KœÝÜ›ÜYØ][ÛŠ
KÛÛXÚÎŠ
OO
OOŠË‹‹™KÚYÙ]Î–Ë‹‹™KÚYÙ]ËË‹‹œ‹Y˜Üž\Ëœ˜[™ÛUURQ

K^[Ý]žË‹‹œ‹›^[Ý]œ‹›^[Ý]ž
ÌŒNœ‹›^[Ý]žJÌŒ_W_JJKÚ[™[Ž˜8©âXJK
‹šœÞ
J]Û˜È˜\šXK[X™[Ž˜; «{('Û”Ú[\‘ÝÛŽ™OO™KœÝÜ›ÜYØ][ÛŠ
KÛÛXÚÎŠ
OOŠ‹šY
KÚ[™[Ž˜0åØJW_J_JW_JK
‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜ÚYÙ]X›ÙXÚ[™[Ž–Ê‹šœÞ
J˜ØÚ[™[Žœ‹]_JK‹\OOOX›ÛÚÛX\šØ	‰Š‹šœÞÊJ‹‘œ˜YÛY[ØÚ[™[Ž–Ê‹šœÞ
JØÛ\ÜÓ˜[YN˜\›Ú[™[Žœ‹™]K\›JK
‹šœÞÊJXÚ™YŽœ‹™]K\›\™Ù]˜Ø›[šØ™[˜›Ü™Y™\œ™\˜Ú[™[Ž–ØÔSˆ‘TÓÕTÑH
‹šœÞ
JÜ[˜ØÚ[™[Ž˜8¡¥ØJW_JW_JK‹\OOOX›ÝX	‰Š‹šœÞ
J^\™XXÈ˜\šXK[X™[Ž˜	Ü‹]_H:à­;&ªX˜[YNœ‹™]K˜›Ù_™XYÛ›Nˆ[‹ÛÚ[™ÙN™OO›J‹šYÙ]NžË‹‹œ‹™]K›ÙN™K\™Ù]˜[Y__J_JK‹\OOOXÙØ	‰Š‹šœÞÊJX™[ØÛ\ÜÓ˜[YN˜ÙØÚ[™[Ž–Ê‹šœÞ
J[œ]Ý\N˜ÚXÚØ›ÞÚXÚÙYˆH\‹™]K™Û™KÛÚ[™ÙN™OO›J‹šYÙ]NžË‹‹œ‹™]KÛ™N™K\™Ù]˜ÚXÚÙY_J_JK
‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YNœ‹™]K™Û™OØÛ™X˜Ú[™[Žœ‹™]K™Û™OØÓÓTUQ˜Sˆ“ÑÔ‘TÔØJW_JK‹\OOOXÙØ	‰Š‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜Y]XÚ[™[Ž–Ê‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜š[Üš]H	Ü‹™]Kœš[Üš]OËÓÝÙ\Ø\ÙJ
_XÚ[™[Žœ‹™]Kœš[Üš]_JK
‹šœÞ
JÜ[˜ØÚ[™[Žœ‹™]K™Y_“ÈPQS‘XJW_JW_JK‰‰ˆ\‹›ØÚÙY	‰Š‹šœÞ
JÜ[˜ØÛ\ÜÓ˜[YN˜™\Ú^™KXÛÜ›™\˜JW_K‹šY
JW_JW_JK
‹šœÞÊJ›ÛÝ\˜ØÚ[™[Ž–Ê‹šœÞÊJÜ[˜ØÚ[™[Ž–ØÐÐSÕÔQÑH
‹šœÞ
J˜ØÚ[™[Ž˜PÕU‘XJW_JK
‹šœÞ
JÜ[˜ØÚ[™[Ž˜UHÕVTÈÓˆTÈU’PÑXJK
‹šœÞ
JÜ[˜ØÚ[™[Ž˜ÔÐQ–HTÒ“ÐT‘0­ÈŒKŒJW_JKI‰Š‹šœÞ
J]˜ØÛ\ÜÓ˜[YN˜[Ù[X˜XÚÙ›ÜÛ“[Ý\ÙQÝÛŽ™OO™K\™Ù]OOYK˜Ý\œ™[\™Ù]	‰˜J[
KÚ[™[ŽŠ‹šœÞÊJ›Ü›XØÛ\ÜÓ˜[YN˜[Ù[Û”ÝX›Z]—ËÚ[™[Ž–Ê‹šœÞÊJ]˜ØÚ[™[Ž–Ê‹šœÞÊJÜ[˜ØÚ[™[Ž–Ø‘UÈÈKÕ\\Ø\ÙJ
W_JK
‹šœÞ
J]Û˜Ý\N˜]Û˜ÛÛXÚÎŠ
OO˜J[
KÚ[™[Ž˜0åØJW_JK
‹šœÞÊJ˜ØÚ[™[Ž–Ø; âOOOX›ÛÚÛX\šØØ:í zéâ;`kšOOOX›ÝXØ:êe:êª˜;eh;'o_JK
‹šœÞÊJX™[ØÚ[™[Ž–Ø;(':êªX
‹šœÞ
J[œ]Û˜[YN˜]X™\]Z\™YˆL]]Ñ›ØÝ\ÎˆLXÙZÛ\Ž˜;(':êª{'a;'¡zè){ef;!.;&¥JW_JKHOOXÙØ	‰Š‹šœÞÊJX™[ØÚ[™[Ž–ÚOOOX›ÛÚÛX\šØØT“˜:à­;&ªXOOOX›ÝXÊ‹šœÞ
J^\™XXÛ˜[YN˜ÛÛ[›ÝÜÎKXÙZÛ\Ž˜:êe:êª:éo;'¡zè){ef;!.;&¥JNŠ‹šœÞ
J[œ]Û˜[YN˜ÛÛ[\N˜\›Y˜][˜[YN˜Î‹ËØ™\]Z\™YˆLJW_JKOOOXÙØ	‰Š‹šœÞÊJ‹‘œ˜YÛY[ØÚ[™[Ž–Ê‹šœÞÊJX™[ØÚ[™[Ž–Ø:éâ:¬$;'o
‹šœÞ
J[œ]Û˜[YN˜YX\N˜]XJW_JK
‹šœÞÊJX™[ØÚ[™[Ž–Ø;&¬;!(;"';'!
‹šœÞÊJÙ[XÝÛ˜[YN˜š[Üš]XÚ[™[Ž–Ê‹šœÞ
JÜ[Û˜ØÚ[™[Ž˜QÒJK
‹šœÞ
JÜ[Û˜ØÚ[™[Ž˜QQUSXJK
‹šœÞ
JÜ[Û˜ØÚ[™[Ž˜ÕØJW_JW_JW_JK
‹šœÞÊJ]˜ØÛ\ÜÓ˜[YN˜[Ù[XXÝ[ÛœØÚ[™[Ž–Ê‹šœÞ
J]Û˜Ý\N˜]Û˜ÛÛXÚÎŠ
OO˜J[
KÚ[™[Ž˜ÐSÑSJK
‹šœÞ
J]Û˜Ý\N˜ÝX›Z]Ú[™[Ž˜Ô‘PUHÒQÑUJW_JW_J_JKI‰Š‹šœÞ
J]˜ØÛ\ÜÓ˜[YN˜Ø\Ý›ÛN˜Ý]\ØÚ[™[Ž_JW_J_JÝ˜Ü™X]T›ÛÝ
JØÝ[Y[™Ù][[Y[žRY
›ÛÝ
JKœ™[™\Š
‹šœÞ
JÝ”ÝšXÝ[ÙKØÚ[™[ŽŠ‹šœÞ
JßJ_JJN