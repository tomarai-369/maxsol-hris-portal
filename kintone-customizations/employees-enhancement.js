/**
 * MS Corp HRIS - Employee Detail Enhancement
 * Adds tabs and statistics to employee detail view
 */

(function() {
  'use strict';

  // App IDs
  const APPS = {
    EMPLOYEES: 303,
    LEAVE_REQUESTS: 304,
    DOCUMENT_REQUESTS: 305,
    ANNOUNCEMENTS: 306,
    LEAVE_BALANCES: 307,
    DTR: 308,
    PAYROLL: 309,
    BENEFITS: 310,
    LOANS: 311,
    SCHEDULES: 312
  };

  // Styles
  const STYLES = `
    .hris-stats-container {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      border-radius: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .hris-stat-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 16px 24px;
      border-radius: 10px;
      text-align: center;
      min-width: 140px;
      flex: 1;
    }
    .hris-stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    .hris-stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .hris-stat-card.success .hris-stat-value { color: #4ade80; }
    .hris-stat-card.warning .hris-stat-value { color: #fbbf24; }
    .hris-stat-card.danger .hris-stat-value { color: #f87171; }
    
    .hris-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0;
    }
    .hris-tab {
      padding: 12px 24px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-weight: 500;
      color: #6b7280;
      transition: all 0.2s;
    }
    .hris-tab:hover {
      color: #1e3a5f;
    }
    .hris-tab.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }
    .hris-tab-content {
      display: none;
    }
    .hris-tab-content.active {
      display: block;
    }
    
    .hris-quick-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .hris-action-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .hris-action-btn.primary {
      background: #2563eb;
      color: white;
    }
    .hris-action-btn.primary:hover {
      background: #1d4ed8;
    }
    .hris-action-btn.secondary {
      background: #f3f4f6;
      color: #374151;
    }
    .hris-action-btn.secondary:hover {
      background: #e5e7eb;
    }
  `;

  // Add styles
  function addStyles() {
    if (document.getElementById('hris-styles')) return;
    const style = document.createElement('style');
    style.id = 'hris-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // Fetch employee statistics
  async function fetchEmployeeStats(employeeId) {
    const stats = {
      leaveBalance: 0,
      leaveUsed: 0,
      pendingLeaves: 0,
      pendingDocs: 0,
      activeLoans: 0,
      loanBalance: 0,
      dtrPresent: 0,
      dtrAbsent: 0
    };

    try {
      // Leave Balances
      const balances = await kintone.api('/k/v1/records', 'GET', {
        app: APPS.LEAVE_BALANCES,
        query: `employee_id = "${employeeId}"`
      });
      balances.records.forEach(r => {
        stats.leaveBalance += parseFloat(r.remaining?.value || 0);
        stats.leaveUsed += parseFloat(r.used?.value || 0);
      });

      // Pending Leaves
      const leaves = await kintone.api('/k/v1/records', 'GET', {
        app: APPS.LEAVE_REQUESTS,
        query: `employee_id = "${employeeId}" and status = "Pending"`,
        totalCount: true
      });
      stats.pendingLeaves = parseInt(leaves.totalCount || 0);

      // Pending Documents
      const docs = await kintone.api('/k/v1/records', 'GET', {
        app: APPS.DOCUMENT_REQUESTS,
        query: `employee_id = "${employeeId}" and status in ("Pending", "Processing")`,
        totalCount: true
      });
      stats.pendingDocs = parseInt(docs.totalCount || 0);

      // Active Loans
      const loans = await kintone.api('/k/v1/records', 'GET', {
        app: APPS.LOANS,
        query: `employee_id = "${employeeId}" and status = "Active"`
      });
      stats.activeLoans = loans.records.length;
      loans.records.forEach(r => {
        stats.loanBalance += parseFloat(r.balance?.value || 0);
      });

      // DTR Stats (current month)
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const dtr = await kintone.api('/k/v1/records', 'GET', {
        app: APPS.DTR,
        query: `employee_id = "${employeeId}" and date >= "${monthStart}"`
      });
      dtr.records.forEach(r => {
        if (r.status?.value === 'Present') stats.dtrPresent++;
        if (r.status?.value === 'Absent') stats.dtrAbsent++;
      });

    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }

    return stats;
  }

  // Render stats dashboard
  function renderStats(stats) {
    const container = document.createElement('div');
    container.className = 'hris-stats-container';
    container.innerHTML = `
      <div class="hris-stat-card success">
        <div class="hris-stat-value">${stats.leaveBalance.toFixed(1)}</div>
        <div class="hris-stat-label">Leave Balance</div>
      </div>
      <div class="hris-stat-card">
        <div class="hris-stat-value">${stats.leaveUsed.toFixed(1)}</div>
        <div class="hris-stat-label">Leave Used</div>
      </div>
      <div class="hris-stat-card ${stats.pendingLeaves > 0 ? 'warning' : ''}">
        <div class="hris-stat-value">${stats.pendingLeaves}</div>
        <div class="hris-stat-label">Pending Leaves</div>
      </div>
      <div class="hris-stat-card ${stats.pendingDocs > 0 ? 'warning' : ''}">
        <div class="hris-stat-value">${stats.pendingDocs}</div>
        <div class="hris-stat-label">Pending Docs</div>
      </div>
      <div class="hris-stat-card ${stats.activeLoans > 0 ? 'danger' : ''}">
        <div class="hris-stat-value">${stats.activeLoans}</div>
        <div class="hris-stat-label">Active Loans</div>
      </div>
      <div class="hris-stat-card">
        <div class="hris-stat-value">₱${(stats.loanBalance / 1000).toFixed(1)}K</div>
        <div class="hris-stat-label">Loan Balance</div>
      </div>
      <div class="hris-stat-card success">
        <div class="hris-stat-value">${stats.dtrPresent}</div>
        <div class="hris-stat-label">Present (Month)</div>
      </div>
      <div class="hris-stat-card ${stats.dtrAbsent > 0 ? 'danger' : ''}">
        <div class="hris-stat-value">${stats.dtrAbsent}</div>
        <div class="hris-stat-label">Absent (Month)</div>
      </div>
    `;
    return container;
  }

  // Event handler for detail/edit view
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], async function(event) {
    addStyles();

    const record = event.record;
    const employeeId = record.employee_id?.value;
    
    if (!employeeId) return event;

    // Add stats dashboard
    const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();
    if (headerSpace) {
      // Clear previous content
      headerSpace.innerHTML = '';
      
      // Show loading
      const loading = document.createElement('div');
      loading.textContent = 'Loading statistics...';
      loading.style.padding = '20px';
      loading.style.color = '#6b7280';
      headerSpace.appendChild(loading);

      // Fetch and render stats
      const stats = await fetchEmployeeStats(employeeId);
      headerSpace.innerHTML = '';
      headerSpace.appendChild(renderStats(stats));
    }

    return event;
  });

  // Quick create buttons on list view
  kintone.events.on('app.record.index.show', function(event) {
    addStyles();
    
    const headerSpace = kintone.app.getHeaderMenuSpaceElement();
    if (!headerSpace || document.getElementById('hris-quick-actions')) return event;

    const actionsDiv = document.createElement('div');
    actionsDiv.id = 'hris-quick-actions';
    actionsDiv.className = 'hris-quick-actions';
    actionsDiv.innerHTML = `
      <a href="/k/${APPS.LEAVE_REQUESTS}/edit" class="hris-action-btn primary">+ Leave Request</a>
      <a href="/k/${APPS.DOCUMENT_REQUESTS}/edit" class="hris-action-btn primary">+ Document Request</a>
      <a href="/k/${APPS.DTR}/edit" class="hris-action-btn secondary">+ DTR Entry</a>
      <a href="/k/${APPS.PAYROLL}/edit" class="hris-action-btn secondary">+ Payroll</a>
    `;
    headerSpace.appendChild(actionsDiv);

    return event;
  });

})();
