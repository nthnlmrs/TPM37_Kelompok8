document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('register-form');
    const step1Inputs = document.getElementById('step1-inputs');
    const step2Inputs = document.getElementById('step2-inputs');
    const step1Btns = document.getElementById('step1-btns');
    const step2Btns = document.getElementById('step2-btns');

    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const submitBtn = form.querySelector('button[type="submit"]');

    const progressStep1 = document.getElementById('progress-step-1');
    const progressStep2 = document.getElementById('progress-step-2');


    function showToast(message, type = 'error') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast-message show ' + (type === 'success' ? 'success' : 'error');

        if (type === 'success') {
            toast.style.background = 'linear-gradient(45deg, #4caf50, #2e7d32)';
        } else {
            toast.style.background = '';
        }

        setTimeout(() => {
            toast.className = 'toast-message';
        }, 4000);
    }

    function showError(fieldId, message) {
        const errorEl = document.getElementById('error-' + fieldId);
        const inputEl = document.getElementById(fieldId);

        if (errorEl) errorEl.textContent = message;
        if (inputEl) inputEl.style.borderColor = 'var(--error)';
    }

    function clearError(fieldId) {
        const errorEl = document.getElementById('error-' + fieldId);
        const inputEl = document.getElementById(fieldId);

        if (errorEl) errorEl.textContent = '';
        if (inputEl) inputEl.style.borderColor = '';
    }

    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        updateRequirementUI('req-length', requirements.length);
        updateRequirementUI('req-upper', requirements.upper);
        updateRequirementUI('req-lower', requirements.lower);
        updateRequirementUI('req-number', requirements.number);
        updateRequirementUI('req-symbol', requirements.symbol);

        return Object.values(requirements).every(v => v);
    }

    function updateRequirementUI(id, isValid) {
        const el = document.getElementById(id);
        if (el) {
            el.className = isValid ? 'valid' : 'invalid';
        }
    }


    nextBtn.addEventListener('click', () => {
        if (validateStep1()) {
            step1Inputs.style.display = 'none';
            step2Inputs.style.display = 'block';
            step1Btns.style.display = 'none';
            step2Btns.style.display = 'flex';

            progressStep1.classList.remove('active');
            progressStep1.style.opacity = '0.5';
            progressStep2.classList.add('active');
            progressStep2.style.opacity = '1';
        }
    });

    backBtn.addEventListener('click', () => {
        step1Inputs.style.display = 'block';
        step2Inputs.style.display = 'none';
        step1Btns.style.display = 'block';
        step2Btns.style.display = 'none';

        progressStep1.classList.add('active');
        progressStep1.style.opacity = '1';
        progressStep2.classList.remove('active');
        progressStep2.style.opacity = '0.5';
    });


    function validateStep1() {
        let isValid = true;


        const teamName = document.getElementById('team-name');
        if (!teamName.value.trim()) {
            showError('team-name', 'Nama tim wajib diisi');
            isValid = false;
        } else {
            clearError('team-name');
        }


        const password = document.getElementById('password');
        if (!validatePassword(password.value)) {
            showError('password', 'Password tidak memenuhi syarat');
            isValid = false;
        } else {
            clearError('password');
        }


        const confirmPass = document.getElementById('confirm-password');
        if (confirmPass.value !== password.value) {
            showError('confirm-password', 'Password tidak cocok');
            isValid = false;
        } else {
            clearError('confirm-password');
        }

        return isValid;
    }

    function validateStep2() {
        let isValid = true;


        const fullName = document.getElementById('full_name');
        if (!fullName.value.trim()) {
            fullName.style.borderColor = 'var(--error)';
            isValid = false;
        } else {
            fullName.style.borderColor = '';
        }


        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            showError('email', 'Email tidak valid');
            isValid = false;
        } else {
            clearError('email');
        }


        const whatsapp = document.getElementById('whatsapp');
        if (whatsapp.value.length < 9) {
            whatsapp.style.borderColor = 'var(--error)';
            isValid = false;
        } else {
            whatsapp.style.borderColor = '';
        }


        const birthDate = document.getElementById('birthdate');
        if (birthDate.value) {
            const today = new Date();
            const bDate = new Date(birthDate.value);
            let age = today.getFullYear() - bDate.getFullYear();
            const m = today.getMonth() - bDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
                age--;
            }
            if (age < 17) {
                showError('birthdate', 'Minimal 17 tahun');
                isValid = false;
            } else {
                clearError('birthdate');
            }
        } else {
            showError('birthdate', 'Wajib diisi');
            isValid = false;
        }


        const cv = document.getElementById('cv');
        if (cv.files.length === 0 && !cv.value) {
            showToast('CV wajib diunggah');
            isValid = false;
        }

        const idDoc = document.getElementById('identity_doc');
        if (idDoc.files.length === 0 && !idDoc.value) {
            showToast('Kartu Identitas wajib diunggah');
            isValid = false;
        }

        return isValid;
    }


    document.getElementById('password').addEventListener('input', (e) => validatePassword(e.target.value));




    document.getElementById('cv').addEventListener('change', function (e) {
        document.getElementById('cv-display').textContent = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    });
    document.getElementById('identity_doc').addEventListener('change', function (e) {
        document.getElementById('identity-display').textContent = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    });


    const radios = document.querySelectorAll('input[name="is_binusian"]');
    const idLabel = document.getElementById('identity-label');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'true' || e.target.value === true) {
                idLabel.textContent = 'Upload Flazz Card *';
            } else {
                idLabel.textContent = 'Upload ID Card (KTP/Student ID) *';
            }
        });
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault();


        if (!validateStep1() || !validateStep2()) {
            showToast('Mohon lengkapi data dengan benar');
            return;
        }


        const formData = new FormData(form);


        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            const res = await fetch('/register', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                showToast('Registrasi Berhasil! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/login-page.html';
                }, 2000);
            } else {
                showToast(data.message || 'Registrasi Gagal');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Finalize Registration';
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan koneksi');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Finalize Registration';
        }
    });
});
