/* HELPCAR Depannage - Main JavaScript */

document.addEventListener('DOMContentLoaded', function() {

  // --- Mobile Navigation Toggle ---
  const burger = document.querySelector('.header__burger');
  const navMobile = document.querySelector('.nav-mobile');

  if (burger && navMobile) {
    burger.addEventListener('click', function() {
      burger.classList.toggle('active');
      navMobile.classList.toggle('open');
      document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
    });

    // Close nav on link click
    navMobile.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        burger.classList.remove('active');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  // --- Toggle Tabs (Services filter) ---
  document.querySelectorAll('.toggle-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var group = this.closest('.toggle-tabs');
      group.querySelectorAll('.toggle-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');

      var filter = this.dataset.filter;
      var grid = document.querySelector('.services-grid[data-filterable]');
      if (grid) {
        grid.querySelectorAll('.service-card').forEach(function(card) {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });
  });

  // --- Active nav link ---
  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-desktop a, .nav-mobile a:not(.nav-mobile__cta)').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && currentPath.indexOf(href) !== -1 && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
      link.classList.add('active');
    }
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
