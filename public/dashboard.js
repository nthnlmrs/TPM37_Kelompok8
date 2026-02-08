document.addEventListener('DOMContentLoaded', async () => {

    try {
        const response = await fetch('/me');
        const result = await response.json();

        if (!response.ok || !result.success) {
            window.location.href = '/login';
            return;
        }

        const data = result.data;
        const leader = data.leader;


        document.getElementById('welcome-message').textContent = `Welcome, ${data.team_name}`;


        document.getElementById('team-username').textContent = data.team_name;
        document.getElementById('team-name').textContent = data.team_name;

        document.getElementById('team-affiliation').textContent = data.is_binusian ? 'Binus University' : 'Non-Binusian';


        document.getElementById('leader-name').textContent = leader.full_name;
        document.getElementById('leader-email').textContent = leader.email;
        document.getElementById('leader-whatsapp').textContent = leader.whatsapp;


        const cvLink = document.getElementById('view-cv');
        const idLink = document.getElementById('view-id');

        if (leader.cv_path) {

            cvLink.href = '/' + leader.cv_path;
        } else {
            cvLink.style.display = 'none';
        }

        if (leader.id_card_path) {
            idLink.href = '/' + leader.id_card_path;
        } else {
            idLink.style.display = 'none';
        }


        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'grid';

    } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/login';
    }


    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    const cancelLogoutBtn = document.getElementById('cancel-logout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'flex';
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'none';
        });
    }


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
