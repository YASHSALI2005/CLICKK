// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.querySelector('.hamburger');
  var menu = document.getElementById('nav-menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', function () {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      if (getComputedStyle(menu).display === 'none') {
        menu.style.display = 'flex';
      } else {
        menu.style.display = 'none';
      }
    });
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
        history.replaceState(null, '', '#' + targetId);
      }
    });
  });

  // Section toggling between dashboard and consumption
  var dashboardSection = document.getElementById('dashboard');
  var consumptionSection = document.getElementById('consumption');
  // Clicking the nav Dashboard or the section header toggles to consumption view
  var dashboardNav = document.querySelector('a[href="#dashboard"]');
  function showDashboard() {
    if (dashboardSection) dashboardSection.style.display = '';
    if (consumptionSection) consumptionSection.style.display = 'none';
  }
  function showConsumption() {
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (consumptionSection) consumptionSection.style.display = '';
    var evt = new CustomEvent('consumption:refresh');
    document.dispatchEvent(evt);
  }
  if (dashboardNav) {
    dashboardNav.addEventListener('click', function (e) {
      e.preventDefault();
      showConsumption();
    });
  }
  var backBtn = document.getElementById('btn-back-dashboard');
  if (backBtn) backBtn.addEventListener('click', showDashboard);
});

