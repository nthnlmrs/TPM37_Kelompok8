document.addEventListener('DOMContentLoaded', async () => {
    const teamList = document.getElementById('team-list');
    const searchBar = document.getElementById('search-bar');
    const sortSelect = document.getElementById('sort-select');

    const viewModal = document.getElementById('view-modal');
    const editModal = document.getElementById('edit-modal');
    const viewModalBody = document.getElementById('view-modal-body');
    const editForm = document.getElementById('edit-form');
    const closeButtons = document.querySelectorAll('.close');
    const cancelEditBtn = document.getElementById('cancel-edit');

    async function fetchTeams() {
        try {
            const searchTerm = searchBar ? searchBar.value : '';
            const sortValue = sortSelect ? sortSelect.value : 'id-asc';
            const [sortBy, order] = sortValue.split('-');

            const url = new URL('/api/admin/teams', window.location.origin);
            if (searchTerm) url.searchParams.append('search', searchTerm);
            url.searchParams.append('sortBy', sortBy);
            url.searchParams.append('order', order);

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                renderTeams(data.data);
            } else {
                console.error('Failed to load teams:', data.message);
                teamList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red">Error: ${data.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function renderTeams(teams) {
        teamList.innerHTML = '';
        if (teams.length === 0) {
            teamList.innerHTML = '<tr><td colspan="6" style="text-align:center">No teams found</td></tr>';
            return;
        }

        const escapeHtml = (unsafe) => {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        teams.forEach(team => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${team.id}</td>
                <td>${escapeHtml(team.team_name)}</td>
                <td>${team.leader ? escapeHtml(team.leader.full_name) : '<span style="color:red">No Leader</span>'}</td>
                <td>
                    <span class="status-badge ${team.is_binusian ? 'binusian' : 'non-binusian'}">
                        ${team.is_binusian ? 'Binusian' : 'Non-Binusian'}
                    </span>
                </td>
                <td>${new Date(team.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-view" data-id="${team.id}" title="View Details"><i class="fas fa-eye"></i> View</button>
                        <button class="btn-sm btn-edit" data-id="${team.id}" title="Edit Team"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-sm btn-delete" data-id="${team.id}" title="Delete Team"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            teamList.appendChild(row);
        });

        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => openViewModal(btn.dataset.id));
        });
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteTeam(btn.dataset.id));
        });
    }

    let debounceTimer;
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetchTeams, 300);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', fetchTeams);
    }

    async function openViewModal(id) {
        try {
            const res = await fetch(`/api/admin/teams/${id}`);
            const result = await res.json();

            if (result.success) {
                const team = result.data;
                const leader = team.leader || {};

                viewModalBody.innerHTML = `
                    <div class="detail-group">
                        <span class="detail-label">Team Name</span>
                        <div class="detail-value">${team.team_name}</div>
                    </div>
                    <div class="detail-group">
                         <span class="detail-label">Status</span>
                         <div class="detail-value">${team.is_binusian ? 'Binusian' : 'Non-Binusian'}</div>
                    </div>
                    <h3>Leader Information</h3>
                    <div class="detail-group">
                        <span class="detail-label">Full Name</span>
                        <div class="detail-value">${leader.full_name || '-'}</div>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Email</span>
                        <div class="detail-value">${leader.email || '-'}</div>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">WhatsApp</span>
                        <div class="detail-value">${leader.whatsapp || '-'}</div>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Line ID</span>
                        <div class="detail-value">${leader.line_id || '-'}</div>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">GitHub</span>
                        <div class="detail-value">${leader.github_id || '-'}</div>
                    </div>
                     <div class="detail-group">
                        <span class="detail-label">Birth Date</span>
                        <div class="detail-value">${leader.birth_date ? new Date(leader.birth_date).toLocaleDateString() : '-'}</div>
                    </div>
                `;
                viewModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            alert('Failed to load team details');
        }
    }

    async function openEditModal(id) {
        try {
            const res = await fetch(`/api/admin/teams/${id}`);
            const result = await res.json();

            if (result.success) {
                const team = result.data;
                const leader = team.leader || {};

                document.getElementById('edit-team-id').value = team.id;
                document.getElementById('edit-team-name').value = team.team_name;
                document.getElementById('edit-full-name').value = leader.full_name || '';
                document.getElementById('edit-email').value = leader.email || '';
                document.getElementById('edit-whatsapp').value = leader.whatsapp || '';

                editModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching details for edit:', error);
        }
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-team-id').value;
            const payload = {
                team_name: document.getElementById('edit-team-name').value,
                leader: {
                    full_name: document.getElementById('edit-full-name').value,
                    email: document.getElementById('edit-email').value,
                    whatsapp: document.getElementById('edit-whatsapp').value
                }
            };

            try {
                const res = await fetch(`/api/admin/teams/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();

                if (result.success) {
                    alert('Team updated successfully');
                    editModal.style.display = 'none';
                    fetchTeams();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Update error:', error);
                alert('Failed to update team');
            }
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewModal.style.display = 'none';
            editModal.style.display = 'none';
        });
    });

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    }

    window.onclick = function (event) {
        if (event.target == viewModal) viewModal.style.display = "none";
        if (event.target == editModal) editModal.style.display = "none";
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/admin/logout', { method: 'POST' });
                window.location.href = '/admin/login';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }

    fetchTeams();

    window.deleteTeam = async function (id) {
        if (!confirm('Are you sure you want to delete this team? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
            const result = await res.json();

            if (result.success) {
                alert('Team deleted successfully');
                fetchTeams();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete team.');
        }
    }
});
