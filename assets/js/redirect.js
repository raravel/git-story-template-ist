const isInIframe = () => (window.self !== window.top);

console.log(isInIframe);
if ( isInIframe() ) {
	// do not anyting.
} else { 
	// redirect view post html
	let p = location.pathname.replace(/index.*$/g, '');
	location.assign(`/?v=${p}`);
}
