(function () {
	'use strict';

	function initMobileMenu() {
		var header = document.getElementById('ast-mobile-header');
		var toggle = header ? header.querySelector('.main-header-menu-toggle') : null;
		var content = header ? header.querySelector('.ast-mobile-header-content') : null;

		if (!header || !toggle || !content) {
			return;
		}

		function setMenu(open) {
			header.classList.toggle('ast-main-header-nav-open', open);
			toggle.classList.toggle('toggled', open);
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			content.style.display = open ? 'block' : '';
		}

		toggle.addEventListener('click', function () {
			setMenu(!header.classList.contains('ast-main-header-nav-open'));
		});

		// Close the menu after a menu link is tapped.
		content.addEventListener('click', function (event) {
			if (event.target.closest('a')) {
				setMenu(false);
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initMobileMenu);
	} else {
		initMobileMenu();
	}
})();
