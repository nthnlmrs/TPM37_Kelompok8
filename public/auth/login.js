document.addEventListener('DOMContentLoaded', () => {

    const eyeIcon = document.getElementById('eye-icon');
    if (eyeIcon) {
        eyeIcon.addEventListener('click', () => {
            const input = document.getElementById('password');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }


    function showToast(message, type = 'error') {
        const toast = document.getElementById('toast');
        toast.textContent = message;

        toast.className = 'toast-message';

        void toast.offsetWidth;

        toast.classList.add('show');
        if (type === 'success') {
            toast.style.background = 'linear-gradient(45deg, #4caf50, #8bc34a)';
        } else {
            toast.style.background = 'linear-gradient(45deg, #e91e63, #f44336)';
        }

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }


    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const teamNameInput = document.getElementById('team-name');
            const passwordInput = document.getElementById('password');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            const team_name = teamNameInput.value.trim();
            const password = passwordInput.value;

            if (!team_name || !password) {
                showToast('Nama tim dan password harus diisi');
                return;
            }

            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ team_name, password })
                });

                const data = await res.json();

                if (data.success) {
                    showToast('Login berhasil! Mengalihkan...', 'success');
                    setTimeout(() => {
                        window.location.href = data.redirect || '/dashboard';
                    }, 1000);
                } else {
                    showToast(data.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            } catch (error) {
                console.error('Login Error:', error);
                showToast('Terjadi kesalahan. Coba lagi.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});
