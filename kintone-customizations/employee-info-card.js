/**
 * MS Corp HRIS - Employee Info Card
 * Shows employee details when viewing leave/document/payroll records
 * Use on: Leave Requests, Document Requests, DTR, Payroll, Loans, Benefits, Schedules
 */

(function() {
  'use strict';

  const EMPLOYEES_APP = 303;

  const STYLES = `
    .hris-employee-card {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .hris-employee-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
    }
    .hris-employee-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .hris-employee-info p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .hris-employee-meta {
      display: flex;
      gap: 20px;
      margin-left: auto;
    }
    .hris-employee-meta-item {
      text-align: center;
    }
    .hris-employee-meta-value {
      font-size: 18px;
      font-weight: 600;
    }
    .hris-employee-meta-label {
      font-size: 11px;
      opacity: 0.8;
      text-transform: uppercase;
    }
    .hris-view-profile {
      background: rgba(255,255,255,0.2);
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      transition: background 0.2s;
    }
    .hris-view-profile:hover {
      background: rgba(255,255,255,0.3);
      color: white;
    }
  `;

  function addStyles() {
    if (document.getElementById('hris-emp-card-styles')) return;
    const style = document.createElement('style');
    style.id = 'hris-emp-card-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  async function fetchEmployee(employeeId) {
    try {
      const resp = await kintone.api('/k/v1/records', 'GET', {
        app: EMPLOYEES_APP,
        query: `employee_id = "${employeeId}"`
      });
      if (resp.records && resp.records.length > 0) {
        const r = resp.records[0];
        return {
          id: r.$id.value,
          employeeId: r.employee_id?.value || '',
          firstName: r.first_name?.value || '',
          lastName: r.last_name?.value || '',
          fullName: r.full_name?.value || `${r.first_name?.value} ${r.last_name?.value}`,
          department: r.department?.value || '',
          position: r.position?.value || '',
          status: r.employment_status?.value || '',
          dateHired: r.date_hired?.value || '',
          email: r.email?.value || ''
        };
      }
    } catch (e) {
      console.error('Failed to fetch employee:', e);
    }
    return null;
  }

  function getInitials(firstName, lastName) {
    return ((firstName || '')[0] || '') + ((lastName || '')[0] || '');
  }

  function calculateTenure(dateHired) {
    if (!dateHired) return '-';
    const hired = new Date(dateHired);
    const now = new Date();
    const years = Math.floor((now - hired) / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor(((now - hired) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    if (years > 0) return `${years}y ${months}m`;
    return `${months} months`;
  }

  function renderEmployeeCard(employee) {
    const card = document.createElement('div');
    card.className = 'hris-employee-card';
    card.innerHTML = `
      <div class="hris-employee-avatar">${getInitials(employee.firstName, employee.lastName)}</div>
      <div class="hris-employee-info">
        <h3>${employee.fullName}</h3>
        <p>${employee.position} • ${employee.department}</p>
        <p style="font-size: 12px; opacity: 0.7">${employee.email}</p>
      </div>
      <div class="hris-employee-meta">
        <div class="hris-employee-meta-item">
          <div class="hris-employee-meta-value">${employee.employeeId}</div>
          <div class="hris-employee-meta-label">Employee ID</div>
        </div>
        <div class="hris-employee-meta-item">
          <div class="hris-employee-meta-value">${employee.status}</div>
          <div class="hris-employee-meta-label">Status</div>
        </div>
        <div class="hris-employee-meta-item">
          <div class="hris-employee-meta-value">${calculateTenure(employee.dateHired)}</div>
          <div class="hris-employee-meta-label">Tenure</div>
        </div>
      </div>
      <a href="/k/${EMPLOYEES_APP}/show#record=${employee.id}" class="hris-view-profile" target="_blank">View Profile</a>
    `;
    return card;
  }

  kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], async function(event) {
    addStyles();

    const record = event.record;
    const employeeId = record.employee_id?.value;
    
    if (!employeeId) return event;

    const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();
    if (!headerSpace || document.querySelector('.hris-employee-card')) return event;

    const employee = await fetchEmployee(employeeId);
    if (employee) {
      headerSpace.appendChild(renderEmployeeCard(employee));
    }

    return event;
  });

})();
