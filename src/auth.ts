import { signUp, signIn, signOut, signInWithGoogle, getUser } from './lib/supabase';

function createModal(): void {
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.innerHTML = `
    <div class="auth-backdrop"></div>
    <div class="auth-box">
      <button class="auth-close" id="authClose">&times;</button>
      <div class="auth-logo">LAY<span>L</span>A</div>

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="signin">Sign in</button>
        <button class="auth-tab" data-tab="signup">Sign up</button>
      </div>

      <div class="auth-panel active" id="panel-signin">
        <button class="auth-google" id="googleSignIn">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div class="auth-divider"><span>or</span></div>

        <input class="auth-input" type="email" id="signinEmail" placeholder="Email" />
        <input class="auth-input" type="password" id="signinPassword" placeholder="Password" />
        <div class="auth-error" id="signinError"></div>
        <button class="auth-submit" id="signinSubmit">Sign in</button>
      </div>

      <div class="auth-panel" id="panel-signup">
        <button class="auth-google" id="googleSignUp">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div class="auth-divider"><span>or</span></div>

        <input class="auth-input" type="email" id="signupEmail" placeholder="Email" />
        <input class="auth-input" type="password" id="signupPassword" placeholder="Password (min 6 chars)" />
        <div class="auth-error" id="signupError"></div>
        <button class="auth-submit" id="signupSubmit">Create account</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  bindModalEvents();
}

function bindModalEvents(): void {
  // Close
  document.getElementById('authClose')?.addEventListener('click', closeModal);
  document.querySelector('.auth-backdrop')?.addEventListener('click', closeModal);

  // Tabs
  document.querySelectorAll<HTMLElement>('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.dataset['tab']!;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${name}`)?.classList.add('active');
    });
  });

  // Google
  document.getElementById('googleSignIn')?.addEventListener('click', () => signInWithGoogle());
  document.getElementById('googleSignUp')?.addEventListener('click', () => signInWithGoogle());

  // Sign in
  document.getElementById('signinSubmit')?.addEventListener('click', async () => {
    const email = (document.getElementById('signinEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('signinPassword') as HTMLInputElement).value;
    const errEl = document.getElementById('signinError')!;
    errEl.textContent = '';
    const { error } = await signIn(email, password);
    if (error) { errEl.textContent = error.message; return; }
    closeModal();
    await updateNavForUser();
    window.dispatchEvent(new Event('layla:goto-dashboard'));
  });

  // Sign up
  document.getElementById('signupSubmit')?.addEventListener('click', async () => {
    const email = (document.getElementById('signupEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('signupPassword') as HTMLInputElement).value;
    const errEl = document.getElementById('signupError')!;
    errEl.textContent = '';
    const { error } = await signUp(email, password);
    if (error) { errEl.textContent = error.message; return; }
    errEl.style.color = '#6c63ff';
    errEl.textContent = 'Check your email to confirm your account!';
  });
}

export function openModal(): void {
  if (!document.getElementById('auth-modal')) createModal();
  document.getElementById('auth-modal')!.classList.add('open');
}

export function closeModal(): void {
  document.getElementById('auth-modal')?.classList.remove('open');
}

export async function updateNavForUser(): Promise<void> {
  const user = await getUser();
  const signInBtn = document.querySelector<HTMLElement>('.btn-ghost');
  const getStartedBtn = document.querySelector<HTMLElement>('.btn-solid');

  if (user && signInBtn && getStartedBtn) {
    signInBtn.textContent = user.email?.split('@')[0] ?? 'Account';
    signInBtn.style.color = '#6c63ff';
    signInBtn.style.borderColor = '#6c63ff';
    signInBtn.onclick = async () => {
      await signOut();
      location.reload();
    };
    getStartedBtn.textContent = 'Dashboard';
    getStartedBtn.dataset['action'] = 'dashboard';

    // Show "Back to Dashboard" buttons on Docs and Examples pages
    document.querySelectorAll<HTMLElement>('.back-to-dash').forEach(btn => {
      btn.style.display = 'flex';
    });
  }
}
