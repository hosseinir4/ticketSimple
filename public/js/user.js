// js/user.js
// ticket rendering & admin logic
class TicketUI {
    static async renderTicketPage(containerEl) {
        // show loading
        containerEl.innerHTML = '<div class="card"><p>Loading tickets...</p></div>';
        try {
            const response = await ApiClient.fetchTickets();
            const tickets = response?.data?.tickets || [];
            const currentUser = AuthManager.getUser();
            const isAdmin = currentUser?.email?.includes('admin') || false;
            // Note: real admin detection from user role. Here we inspect email for demo but you can extend.
            // however we differentiate by email or name? But backend sends all tickets if admin, so we rely on that.
            // We will check if user is admin by response difference but mainly we let admin show bulk actions.
            // to detect admin type: admin_level_one / admin_level_two based on email. For simplicity:
            let adminType = null;
            if (currentUser && currentUser.email) {
                if (currentUser.email.includes('admin_level_one') || currentUser.name === 'Admin One') adminType = 'confirm';
                else if (currentUser.email.includes('admin_level_two') || currentUser.name === 'Admin Two') adminType = 'approve';
                else if (currentUser.email.includes('admin')) adminType = 'approve';
            }

            // if user email doesn't have admin word, just normal user
            const isAnyAdmin = !!(currentUser && (currentUser.email.includes('admin') || currentUser.name?.toLowerCase().includes('admin')));

            // render
            let html = `<div class="card"><div class="tickets-header"><h2><i class="fas fa-ticket-alt"></i> Tickets</h2>`;
            if (!isAnyAdmin) {
                html += `<button id="createTicketBtn" class="btn btn-primary"><i class="fas fa-plus"></i> New Ticket</button>`;
            }
            html += `</div>`;

            if (isAnyAdmin && tickets.length > 0) {
                // bulk checkbox controls
                html += `<div class="bulk-bar">
                            <div><strong>Bulk Actions</strong></div>
                            <div>
                                <button id="bulkSelectAllBtn" class="btn btn-sm">Select All</button>
                                ${adminType === 'approve' ? `<button id="bulkApproveBtn" class="btn btn-primary btn-sm"><i class="fas fa-check-circle"></i> Bulk Approve</button>` : ''}
                                ${adminType === 'confirm' ? `<button id="bulkConfirmBtn" class="btn btn-primary btn-sm"><i class="fas fa-check-double"></i> Bulk Confirm</button>` : ''}
                            </div>
                        </div>`;
            }

            html += `<div class="tickets-grid" id="ticketsList"></div></div>`;
            if (!isAnyAdmin) {
                html += `<div id="createFormContainer" style="display:none;" class="card"><h3>Create Ticket</h3>
                        <form id="ticketForm"><div class="form-group"><label>Title</label><input type="text" id="ticketTitle" required></div>
                        <div class="form-group"><label>Body</label><textarea id="ticketBody" rows="3" required></textarea></div>
                        <div class="form-group"><label>File (optional)</label><input type="file" id="ticketFile"></div>
                        <button type="submit" class="btn btn-primary">Submit Ticket</button> <button type="button" id="cancelCreate" class="btn">Cancel</button></form></div>`;
            }
            containerEl.innerHTML = html;

            const ticketsContainer = document.getElementById('ticketsList');
            this.renderTicketsList(tickets, ticketsContainer, isAnyAdmin, adminType);

            if (!isAnyAdmin) {
                document.getElementById('createTicketBtn')?.addEventListener('click', () => {
                    const formDiv = document.getElementById('createFormContainer');
                    if(formDiv) formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
                });
                document.getElementById('cancelCreate')?.addEventListener('click', () => {
                    document.getElementById('createFormContainer').style.display = 'none';
                });
                const ticketForm = document.getElementById('ticketForm');
                if(ticketForm) {
                    ticketForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const title = document.getElementById('ticketTitle').value;
                        const body = document.getElementById('ticketBody').value;
                        const fileInput = document.getElementById('ticketFile');
                        const formData = new FormData();
                        formData.append('title', title);
                        formData.append('body', body);
                        if(fileInput.files[0]) formData.append('file', fileInput.files[0]);
                        try {
                            await ApiClient.createTicket(formData);
                            this.showToast('Ticket created successfully', 'success');
                            document.getElementById('createFormContainer').style.display = 'none';
                            this.renderTicketPage(containerEl);
                        } catch(err) {
                            this.showToast(err.message || 'Creation failed', 'error');
                        }
                    });
                }
            }

            // attach ticket action listeners after render
            this.attachTicketActions(tickets, isAnyAdmin, adminType);
            if(isAnyAdmin) this.attachBulkActions(tickets, adminType);
        } catch (error) {
            containerEl.innerHTML = `<div class="card"><p class="error">Error loading tickets: ${error.message}</p></div>`;
            this.showToast(error.message, 'error');
        }
    }

    static renderTicketsList(tickets, container, isAdmin, adminType) {
        if(!tickets.length) { container.innerHTML = '<div class="card">No tickets found. Create one!</div>'; return; }
        let html = '';
        tickets.forEach(ticket => {
            const statusClass = ticket.status === 'approved' ? 'badge-approved' : (ticket.status === 'reject' ? 'badge-reject' : (ticket.status === 'confirm' ? 'badge-confirm' : 'badge-pending'));
            html += `<div class="ticket-item" data-ticket-id="${ticket.id}">
                        <div class="ticket-info">
                            <div class="ticket-title">
                                <span>${this.escapeHtml(ticket.title)}</span>
                                <span class="badge ${statusClass}">${ticket.status || 'pending'}</span>
                                ${isAdmin ? `<span class="badge">User #${ticket.user_id}</span>` : ''}
                            </div>
                            <div class="ticket-meta">${this.escapeHtml(ticket.body.substring(0, 120))}${ticket.body.length>120?'...':''}</div>
                            ${ticket.note ? `<div class="ticket-meta"><i class="fas fa-comment"></i> Note: ${this.escapeHtml(ticket.note)}</div>` : ''}
                            ${ticket.created_at ? `<div class="ticket-meta">📅 ${new Date(ticket.created_at).toLocaleString()}</div>` : ''}
                        </div>
                        <div class="ticket-actions" data-id="${ticket.id}">
                            ${isAdmin ? `<input type="checkbox" class="ticket-checkbox" data-id="${ticket.id}" style="width:18px;height:18px;margin-right:5px;">` : ''}
                            ${(isAdmin && adminType === 'approve' && ticket.status !== 'approved') ? `<button class="btn btn-sm approve-single" data-id="${ticket.id}">Approve</button>` : ''}
                            ${(isAdmin && adminType === 'confirm' && ticket.status !== 'confirm') ? `<button class="btn btn-sm confirm-single" data-id="${ticket.id}">Confirm</button>` : ''}
                            ${isAdmin ? `<button class="btn btn-sm reject-single" data-id="${ticket.id}">Reject + note</button>` : ''}
                        </div>
                    </div>`;
        });
        container.innerHTML = html;
    }

    static attachTicketActions(tickets, isAdmin, adminType) {
        // single approve
        document.querySelectorAll('.approve-single').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                try {
                    await ApiClient.approveTicket(id);
                    this.showToast('Ticket will be approve', 'success');
                    this.refreshCurrentPage();
                } catch(err) { this.showToast(err.message, 'error'); }
            });
        });
        document.querySelectorAll('.confirm-single').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                try {
                    await ApiClient.confirmTicket(id);
                    this.showToast('Ticket confirmed', 'success');
                    this.refreshCurrentPage();
                } catch(err) { this.showToast(err.message, 'error'); }
            });
        });
        document.querySelectorAll('.reject-single').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const note = prompt('Enter rejection note:');
                if(note === null) return;
                try {
                    await ApiClient.rejectTicket(id, note);
                    this.showToast('Ticket rejected', 'success');
                    this.refreshCurrentPage();
                } catch(err) { this.showToast(err.message, 'error'); }
            });
        });
    }

    static attachBulkActions(tickets, adminType) {
        const selectAllBtn = document.getElementById('bulkSelectAllBtn');
        if(selectAllBtn) {
            selectAllBtn.onclick = () => {
                document.querySelectorAll('.ticket-checkbox').forEach(cb => cb.checked = true);
            };
        }
        const bulkApprove = document.getElementById('bulkApproveBtn');
        if(bulkApprove && adminType === 'approve') {
            bulkApprove.onclick = async () => {
                const selected = this.getSelectedIds();
                if(!selected.length) return this.showToast('Select at least one ticket', 'error');
                try {
                    await ApiClient.bulkApprove(selected);
                    this.showToast(`Approved ${selected.length} tickets`, 'success');
                    this.refreshCurrentPage();
                } catch(e) { this.showToast(e.message, 'error'); }
            };
        }
        const bulkConfirm = document.getElementById('bulkConfirmBtn');
        if(bulkConfirm && adminType === 'confirm') {
            bulkConfirm.onclick = async () => {
                const selected = this.getSelectedIds();
                if(!selected.length) return this.showToast('Select tickets', 'error');
                try {
                    await ApiClient.bulkConfirm(selected);
                    this.showToast(`Confirmed ${selected.length} tickets`, 'success');
                    this.refreshCurrentPage();
                } catch(e) { this.showToast(e.message, 'error'); }
            };
        }
    }

    static getSelectedIds() {
        const checkboxes = document.querySelectorAll('.ticket-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    }

    static refreshCurrentPage() {
        if(window.router && window.router.currentRoute) {
            window.router.navigate(window.router.currentRoute);
        }
    }

    static showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    static escapeHtml(str) {
        if(!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        });
    }
}
