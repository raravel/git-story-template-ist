document.addEventListener('DOMContentLoaded', function() {
	var elems = document.querySelector('#mobile-sidebar');
	var instances = M.Sidenav.init(elems, {
		edge: 'right'
	});

	document.querySelector('#open-menu').addEventListener('click', () => {
		instances.open();
	});
});
