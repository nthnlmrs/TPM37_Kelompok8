document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch User Data
    try {
        const response = await fetch('/me');
        const result = await response.json();

        if (!response.ok || !result.success) {
            // Not authenticated, redirect to login
            window.location.href = '/login';
            return;
        }

        const data = result.data;
        const leader = data.leader;

        // 2. Populate UI
        document.getElementById('welcome-message').textContent = `Welcome, ${data.team_name}`;

        // Team Info
        document.getElementById('team-username').textContent = data.team_name;
        document.getElementById('team-name').textContent = data.team_name;

        document.getElementById('team-affiliation').textContent = data.is_binusian ? 'Binus University' : 'Non-Binusian';

        // Leader Info
        document.getElementById('leader-name').textContent = leader.full_name;
        document.getElementById('leader-email').textContent = leader.email;
        document.getElementById('leader-whatsapp').textContent = leader.whatsapp;

        // Document Links
        const cvLink = document.getElementById('view-cv');
        const idLink = document.getElementById('view-id');

        if (leader.cv_path) {
            // Backend sends path like "uploads/..." or just "uploads/..."
            // Ensure we prepend / if it's not absolute (it won't be from common file uploads)
            // But we already normalized it in backend to use forward slashes.
            // If server serves root, then /uploads/... is correct.
            cvLink.href = '/' + leader.cv_path;
        } else {
            cvLink.style.display = 'none';
        }

        if (leader.id_card_path) {
            idLink.href = '/' + leader.id_card_path;
        } else {
            idLink.style.display = 'none';
        }

        // Show Content
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'grid';

    } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/login';
    }

    // 3. Logout Modal Logic
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    const cancelLogoutBtn = document.getElementById('cancel-logout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'flex'; // Use flex to center with existing modal CSS usually, or block
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'none';
        });
    }

    // Close on click outside
    window.onclick = function (event) {
        if (event.target == logoutModal) {
            logoutModal.style.display = 'none';
        }
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (result.success) {
                    window.location.href = '/';
                } else {
                    alert('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});
