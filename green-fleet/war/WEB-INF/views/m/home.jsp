<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<!DOCTYPE HTML>
<html manifest="cache.manifest" lang="en-US">
	<head>
	    <meta charset="UTF-8">
		<title>Green Fleet</title>

		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&region=KR&language=KO"></script>
		<script src="lib/locale/locale.js"></script>
		<!-- GAE Channel을 이용하려면 아래 주석 해제 -->
		<!--script src='/_ah/channel/jsapi'></script-->
		
		<script>
		var login = {
			key : '<sec:authentication property="principal.key"/>',
			email : '<sec:authentication property="principal.email"/>',
			username : '<sec:authentication property="principal.name"/>',
			company : '<sec:authentication property="principal.company"/>',
			locale : '<sec:authentication property="principal.language"/>'
		};
		
		var System = System || {};
		System.props = {
			lat : 37.55,
			lng : 126.97
		};

		initLocalization(this);
		</script>
		
		<script src="resources/text/en.js"></script>
		<script src="resources/text/touch_en.js"></script>
    <script type="text/javascript">(function(i){function r(a){function b(a,j){var c=a.length,b,g;for(b=0;b<c;b++){g=a[b];var e=a,K=b,d=void 0;"string"==typeof g&&(g={path:g});g.shared?(g.version=g.shared,d=g.shared+g.path):(A.href=g.path,d=A.href);g.uri=d;g.key=h+"-"+d;f[d]=g;e[K]=g;g.type=j;g.index=b;g.collection=a;g.ready=!1;g.evaluated=!1}return a}var c;"string"==typeof a?(c=a,a=B(c)):c=JSON.stringify(a);var h=a.id,e=h+"-"+C+o,f={};this.key=e;this.css=b(a.css,"css");this.js=b(a.js,"js");this.assets=this.css.concat(this.js);this.getAsset=
function(a){return f[a]};this.store=function(){s(e,c)}}function v(a,b){k.write('<meta name="'+a+'" content="'+b+'">')}function p(a,b,c){var h=new XMLHttpRequest,c=c||D,a=a+(-1==a.indexOf("?")?"?":"&")+Date.now();try{h.open("GET",a,!0),h.onreadystatechange=function(){if(4==h.readyState){var a=h.status,d=h.responseText;200<=a&&300>a||304==a||0==a&&0<d.length?b(d):c()}},h.send(null)}catch(d){c()}}function L(a,b){var c=k.createElement("iframe");m.push({iframe:c,callback:b});c.src=a+".html";c.style.cssText=
"width:0;height:0;border:0;position:absolute;z-index:-999;visibility:hidden";k.body.appendChild(c)}function E(a,b,c){var d=!!a.shared;if(!d)var e=b,f=a.version,l,b=function(j){l=j.substring(0,f.length+4);l!=="/*"+f+"*/"?confirm("Requested: '"+a.uri+"' with checksum: "+f+" but received: "+l.substring(2,f.length)+"instead. Attempt to refresh the application?")&&M():e(j)};(d?L:p)(a.uri,b,c)}function F(a){var b=a.data,a=a.source.window,c,d,e,f;for(c=0,d=m.length;c<d;c++)if(e=m[c],f=e.iframe,f.contentWindow===
a){e.callback(b);k.body.removeChild(f);m.splice(c,1);break}}function G(a){"undefined"!=typeof console&&(console.error||console.log).call(console,a)}function s(a,b){try{n.setItem(a,b)}catch(c){if(c.code==c.QUOTA_EXCEEDED_ERR){var d=t.assets.map(function(a){return a.key}),e=0,f=n.length,l=!1,j;for(d.push(t.key);e<=f-1;)j=n.key(e),-1==d.indexOf(j)?(n.removeItem(j),l=!0,f--):e++;l&&s(a,b)}}}function u(a){try{return n.getItem(a)}catch(d){return null}}function M(){H||(H=!0,p(o,function(a){(new r(a)).store();
i.location.reload()}))}function w(a){function b(a,d){var b=a.collection,g=a.index,f=b.length,e;a.ready=!0;a.content=d;for(e=g-1;0<=e;e--)if(a=b[e],!a.ready||!a.evaluated)return;for(e=g;e<f;e++)if(a=b[e],a.ready)a.evaluated||c(a);else break}function c(a){a.evaluated=!0;if("js"==a.type)try{eval(a.content)}catch(d){G("Error evaluating "+a.uri+" with message: "+d)}else{var b=k.createElement("style"),c;b.type="text/css";b.textContent=a.content;"id"in a&&(b.id=a.id);"disabled"in a&&(b.disabled=a.disabled);
c=document.createElement("base");c.href=a.path.replace(/\/[^\/]*$/,"/");x.appendChild(c);x.appendChild(b);x.removeChild(c)}delete a.content;0==--f&&h()}function h(){function b(){k&&c()}function c(){var a=q.onUpdated||D;if("onSetup"in q)q.onSetup(a);else a()}function e(){l.store();h.forEach(function(a){s(a.key,a.content)});c()}function g(a,b){a.content=b;0==--m&&(d.status==d.IDLE?e():i=e)}function f(){I("online",f,!1);p(o,function(c){t=l=new r(c);var e;l.assets.forEach(function(b){e=a.getAsset(b.uri);
(!e||b.version!==e.version)&&h.push(b)});m=h.length;0==m?d.status==d.IDLE?b():i=b:h.forEach(function(b){function c(){E(b,function(a){g(b,a)})}var d=a.getAsset(b.uri),e=b.path,f=b.update;!d||!f||null===u(b.key)||"delta"!=f?c():p("deltas/"+e+"/"+d.version+".json",function(a){try{var c=b,d;var e=u(b.key),f=B(a),a=[],h,j,i;if(0===f.length)d=e;else{for(j=0,i=f.length;j<i;j++)h=f[j],"number"===typeof h?a.push(e.substring(h,h+f[++j])):a.push(h);d=a.join("")}g(c,d)}catch(k){G("Malformed delta content received for "+
b.uri)}},c)})})}var h=[],k=!1,i=function(){},n=function(){d.swapCache();k=!0;i()},m;I("message",F,!1);if(d.status==d.UPDATEREADY)n();else if(d.status==d.CHECKING||d.status==d.DOWNLOADING)d.onupdateready=n,d.onnoupdate=d.onobsolete=function(){i()};!1!==navigator.onLine?f():y("online",f,!1)}var e=a.assets,f=e.length,l;t=a;y("message",F,!1);0==f?h():e.forEach(function(a){var c=u(a.key);null===c?E(a,function(c){s(a.key,c);b(a,c)},function(){b(a,"")}):b(a,c)})}function J(a){null!==k.readyState.match(/interactive|complete|loaded/)?
w(a):y("DOMContentLoaded",function(){navigator.standalone?setTimeout(function(){setTimeout(function(){w(a)},1)},1):w(a)},!1)}var D=function(){},m=[],k=i.document,x=k.head,y=i.addEventListener,I=i.removeEventListener,n=i.localStorage,d=i.applicationCache,B=JSON.parse,A=k.createElement("a"),z=k.location,C=z.origin+z.pathname+z.search,o="app.json",H=!1,t;if("undefined"===typeof q)var q=i.Ext={};q.blink=function(a){var b=u(a.id+"-"+C+o);v("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");
v("apple-mobile-web-app-capable","yes");v("apple-touch-fullscreen","yes");b?(a=new r(b),J(a)):p(o,function(b){a=new r(b);a.store();J(a)})}})(this);
;Ext.blink({"id":"dd271e20-7992-11e1-937c-837dc7358984"})</script>
	</head>
	<body>
	    <div id="appLoadingIndicator">
	        <div></div>
	        <div></div>
	        <div></div>
	    </div>
	</body>
</html>
