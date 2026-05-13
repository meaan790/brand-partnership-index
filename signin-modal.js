(function() {
  const PERSONAL_DOMAINS = new Set([
    'gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com',
    'icloud.com','mail.com','protonmail.com','zoho.com','yandex.com',
    'live.com','msn.com','me.com','mac.com','fastmail.com',
    'hey.com','tutanota.com','gmx.com','inbox.com','pm.me'
  ]);

  var currentRole = null;

  function ssoButtons(idPrefix, redirectUrl) {
    return `
      <button class="w-full flex items-center justify-center px-5 py-2.5 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary cursor-pointer" type="button" onclick="window.location.href='${redirectUrl}'">
        <svg aria-hidden="true" class="w-5 h-5 mr-3 text-[#0a66c2]" fill="currentColor" viewBox="0 0 24 24"><path clip-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill-rule="evenodd"></path></svg>
        Continue with LinkedIn
      </button>
      <button class="w-full flex items-center justify-center px-5 py-2.5 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary cursor-pointer" type="button" onclick="window.location.href='${redirectUrl}'">
        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </button>
      <div class="flex items-center gap-3 my-1"><div class="flex-1 border-t border-border-hairline"></div><span class="font-caption text-caption text-text-caption">or</span><div class="flex-1 border-t border-border-hairline"></div></div>
      <form class="space-y-3" onsubmit="event.preventDefault();handleModalEmail('${idPrefix}')">
        <div>
          <label class="sr-only" for="modal-${idPrefix}-email">Work Email</label>
          <input class="w-full px-4 py-2.5 bg-surface-card border border-border-hairline rounded font-body-md text-body-md text-on-background placeholder:text-text-caption focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors" id="modal-${idPrefix}-email" placeholder="you@company.com" type="email">
          <p id="modal-${idPrefix}-email-error" class="font-caption text-caption text-error mt-1 hidden"></p>
        </div>
        <button class="w-full flex items-center justify-center px-5 py-2.5 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary cursor-pointer" type="submit">Continue with Email</button>
      </form>`;
  }

  function inboxState(idPrefix) {
    return `
      <div id="modal-${idPrefix}-inbox" class="text-center hidden">
        <span class="material-symbols-outlined text-accent mb-3" style="font-size:40px;font-variation-settings:'FILL' 1">mark_email_read</span>
        <h3 class="font-headline-sm text-headline-sm text-primary mb-2">Check your inbox</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mb-3">We sent a magic link to <strong id="modal-${idPrefix}-sent-email" class="text-primary"></strong>.</p>
        <button onclick="resetModalEmail('${idPrefix}')" class="font-caption text-caption text-primary hover:underline cursor-pointer">Use a different email</button>
      </div>`;
  }

  function modalHtml() {
    return `
<div id="signin-modal" class="fixed inset-0 z-[100] hidden" role="dialog" aria-modal="true">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="signin-backdrop"></div>
  <div class="relative flex items-center justify-center min-h-full p-4">
    <div class="bg-background-paper rounded-lg shadow-xl w-full max-w-[480px] relative">
      <button id="signin-modal-close" class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer" aria-label="Close">
        <span class="material-symbols-outlined text-text-caption text-xl">close</span>
      </button>

      <!-- VIEW 1: Sign In -->
      <div id="signin-view-signin">
        <div class="text-center pt-8 pb-4 px-8">
          <h2 class="font-headline-md text-headline-md text-on-background mb-2">Sign in to the Index</h2>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">Welcome back. Sign in with your linked account.</p>
        </div>

        <div class="px-8 pb-6">
          <div id="modal-signin-auth" class="space-y-3">
            ${ssoButtons('signin', 'retailer-dashboard.html')}
          </div>
          ${inboxState('signin')}
        </div>

        <div class="border-t border-border-hairline px-8 py-4 text-center">
          <p class="font-caption text-caption text-text-caption">New here? <button onclick="switchModalView('signup')" class="text-primary font-semibold hover:underline cursor-pointer">Create an account</button></p>
        </div>
      </div>

      <!-- VIEW 2: Create Account -->
      <div id="signin-view-signup" class="hidden">
        <div class="text-center pt-8 pb-4 px-8">
          <h2 class="font-headline-md text-headline-md text-on-background mb-2">Create your free account</h2>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">Select your role to get started.</p>
        </div>

        <!-- Role selection cards -->
        <div id="signup-role-select" class="px-8 pb-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onclick="selectSignupRole('retailer')" class="signup-role-card group flex flex-col items-center text-center p-5 border border-border-hairline rounded-lg hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer" data-role="retailer">
              <span class="inline-flex items-center justify-center w-10 h-10 bg-surface-container-low rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">storefront</span>
              </span>
              <h3 class="font-headline-sm text-headline-sm text-on-background mb-1">I am a Retailer</h3>
              <p class="font-caption text-caption text-on-surface-variant">Review brands and access the full leaderboard.</p>
            </button>
            <button onclick="selectSignupRole('brand')" class="signup-role-card group flex flex-col items-center text-center p-5 border border-border-hairline rounded-lg hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer" data-role="brand">
              <span class="inline-flex items-center justify-center w-10 h-10 bg-surface-container-low rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">corporate_fare</span>
              </span>
              <h3 class="font-headline-sm text-headline-sm text-on-background mb-1">I am a Brand</h3>
              <p class="font-caption text-caption text-on-surface-variant">View your profile and respond to feedback.</p>
            </button>
          </div>
        </div>

        <!-- Auth buttons (shown after role selection) -->
        <div id="signup-auth-section" class="px-8 pb-6 hidden">
          <button onclick="backToRoleSelect()" class="flex items-center gap-1 text-primary font-caption text-caption hover:underline cursor-pointer mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span>Change role</span>
          </button>
          <div id="signup-role-badge" class="flex items-center gap-2 mb-4 px-3 py-2 bg-surface-container-low rounded">
            <span id="signup-role-icon" class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1;">storefront</span>
            <span id="signup-role-label" class="font-data-tabular text-data-tabular text-primary">Signing up as a Retailer</span>
          </div>
          <div id="modal-signup-auth" class="space-y-3">
            ${ssoButtons('signup', 'retailer-dashboard.html')}
          </div>
          ${inboxState('signup')}
        </div>

        <div class="border-t border-border-hairline px-8 py-4 text-center">
          <p class="font-caption text-caption text-text-caption">Already have an account? <button onclick="switchModalView('signin')" class="text-primary font-semibold hover:underline cursor-pointer">Sign in</button></p>
        </div>
      </div>

      <div class="border-t border-border-hairline px-8 py-3 text-center">
        <p class="font-caption text-caption text-text-caption">By continuing, you agree to the <a class="text-primary hover:underline" href="#">Terms of Service</a> and <a class="text-primary hover:underline" href="#">Privacy Policy</a>.</p>
      </div>
    </div>
  </div>
</div>`;
  }

  document.body.insertAdjacentHTML('beforeend', modalHtml());

  var modal = document.getElementById('signin-modal');
  var backdrop = document.getElementById('signin-backdrop');
  var closeBtn = document.getElementById('signin-modal-close');

  function resetAllStates() {
    ['signin', 'signup'].forEach(function(id) {
      var auth = document.getElementById('modal-' + id + '-auth');
      var inbox = document.getElementById('modal-' + id + '-inbox');
      if (auth) auth.classList.remove('hidden');
      if (inbox) inbox.classList.add('hidden');
      var input = document.getElementById('modal-' + id + '-email');
      var error = document.getElementById('modal-' + id + '-email-error');
      if (input) { input.value = ''; input.classList.remove('border-error'); }
      if (error) error.classList.add('hidden');
    });
    document.getElementById('signup-role-select').classList.remove('hidden');
    document.getElementById('signup-auth-section').classList.add('hidden');
    document.querySelectorAll('.signup-role-card').forEach(function(c) {
      c.classList.remove('border-primary', 'bg-surface-container-low');
    });
    currentRole = null;
  }

  window.switchModalView = function(view) {
    resetAllStates();
    document.getElementById('signin-view-signin').classList.toggle('hidden', view !== 'signin');
    document.getElementById('signin-view-signup').classList.toggle('hidden', view !== 'signup');
  };

  window.selectSignupRole = function(role) {
    currentRole = role;
    document.getElementById('signup-role-select').classList.add('hidden');
    document.getElementById('signup-auth-section').classList.remove('hidden');

    var redirect = role === 'brand' ? 'brand-dashboard.html' : 'retailer-dashboard.html';
    var icon = role === 'brand' ? 'corporate_fare' : 'storefront';
    var label = role === 'brand' ? 'Signing up as a Brand' : 'Signing up as a Retailer';

    document.getElementById('signup-role-icon').textContent = icon;
    document.getElementById('signup-role-label').textContent = label;

    document.querySelectorAll('#signup-auth-section button[onclick*="location"]').forEach(function(btn) {
      btn.setAttribute('onclick', "window.location.href='" + redirect + "'");
    });
  };

  window.backToRoleSelect = function() {
    document.getElementById('signup-auth-section').classList.add('hidden');
    document.getElementById('signup-role-select').classList.remove('hidden');
    var authEl = document.getElementById('modal-signup-auth');
    var inboxEl = document.getElementById('modal-signup-inbox');
    if (authEl) authEl.classList.remove('hidden');
    if (inboxEl) inboxEl.classList.add('hidden');
    currentRole = null;
  };

  window.openSignInModal = function(view, preselectedRole) {
    resetAllStates();
    var v = view || 'signin';
    document.getElementById('signin-view-signin').classList.toggle('hidden', v !== 'signin');
    document.getElementById('signin-view-signup').classList.toggle('hidden', v !== 'signup');
    if (v === 'signup' && preselectedRole) {
      selectSignupRole(preselectedRole);
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeSignInModal = function() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeSignInModal);
  backdrop.addEventListener('click', closeSignInModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeSignInModal();
  });

  window.handleModalEmail = function(idPrefix) {
    var input = document.getElementById('modal-' + idPrefix + '-email');
    var error = document.getElementById('modal-' + idPrefix + '-email-error');
    var email = (input.value || '').trim().toLowerCase();

    error.classList.add('hidden');
    input.classList.remove('border-error');

    if (!email || !email.includes('@')) {
      error.textContent = 'Please enter a valid email address.';
      error.classList.remove('hidden');
      input.classList.add('border-error');
      return;
    }

    var domain = email.split('@')[1];
    if (PERSONAL_DOMAINS.has(domain)) {
      error.textContent = 'Please use a work email address (not ' + domain + ').';
      error.classList.remove('hidden');
      input.classList.add('border-error');
      return;
    }

    document.getElementById('modal-' + idPrefix + '-auth').classList.add('hidden');
    document.getElementById('modal-' + idPrefix + '-inbox').classList.remove('hidden');
    document.getElementById('modal-' + idPrefix + '-sent-email').textContent = email;
  };

  window.resetModalEmail = function(idPrefix) {
    document.getElementById('modal-' + idPrefix + '-inbox').classList.add('hidden');
    document.getElementById('modal-' + idPrefix + '-auth').classList.remove('hidden');
  };

  document.querySelectorAll('a[href*="signin.html"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var text = (link.textContent || '').toLowerCase();
      var href = link.getAttribute('href') || '';
      if (text.indexOf('create') !== -1 || text.indexOf('account') !== -1) {
        openSignInModal('signup');
      } else if (href.indexOf('type=brand') !== -1 || text.indexOf('claim') !== -1) {
        openSignInModal('signup', 'brand');
      } else {
        openSignInModal('signin');
      }
    });
  });
})();
