// ==========================================================================
// ZipperFlow Application Controller & State Engine
// ==========================================================================

// --- Default Application State ---
const DEFAULT_STATE = {
  theme: 'dark-theme',
  pricing: {
    '36': 35, // Price in Rs. per zipper size
    '48': 45,
    '54': 50,
    '72': 65
  },
  inventory: {
    cloth: 150,     // Roll of cloth (meters)
    zipper: 300,    // Zipper tape (meters)
    sliders: 250    // Zipper sliders (pcs)
  },
  thresholds: {
    cloth: 30,      // Low stock warning (meters)
    zipper: 50,     // Low stock warning (meters)
    sliders: 40     // Low stock warning (pcs)
  },
  inboundLogs: [
    { id: 'in-1', date: '2026-05-15', type: 'cloth', quantity: 100, notes: 'Direct delivery from SleepSafe Co.' },
    { id: 'in-2', date: '2026-05-15', type: 'zipper', quantity: 200, notes: 'Premium Grade Nylon Zipper coil' },
    { id: 'in-3', date: '2026-05-15', type: 'sliders', quantity: 150, notes: 'Metal Zipper Slider batch' }
  ],
  orders: [
    {
      id: 'ord-1001',
      orderNumber: 'ORD-1001',
      clientName: 'Comfort Mattresses LLC',
      zipperType: '48',
      quantity: 100,
      status: 'completed',
      dateCreated: '2026-05-10',
      dateCompleted: '2026-05-14',
      inventoryDeducted: true,
      notes: 'Initial work order. Delivered on time.'
    },
    {
      id: 'ord-1002',
      orderNumber: 'ORD-1002',
      clientName: 'SleepWell Co.',
      zipperType: '54',
      quantity: 80,
      status: 'sewing',
      dateCreated: '2026-05-28',
      dateCompleted: '',
      inventoryDeducted: true,
      notes: 'Urgent mattress border zipper order.'
    },
    {
      id: 'ord-1003',
      orderNumber: 'ORD-1003',
      clientName: 'DreamLand Ltd.',
      zipperType: '72',
      quantity: 40,
      status: 'pending',
      dateCreated: '2026-06-01',
      dateCompleted: '',
      inventoryDeducted: false,
      notes: 'Standard mattress zippers.'
    }
  ],
  expenses: [
    { id: 'exp-1', date: '2026-05-01', category: 'Rent', amount: 15000, notes: 'Rented shop space' },
    { id: 'exp-2', date: '2026-05-05', category: 'Electricity', amount: 4500, notes: 'Industrial sewing tariff rate' },
    { id: 'exp-3', date: '2026-05-15', category: 'Wages', amount: 30000, notes: 'Monthly wages for 2 tailors' },
    { id: 'exp-4', date: '2026-05-20', category: 'Maintenance', amount: 1500, notes: 'Machine sewing needles & oil' }
  ],
  machines: [
    { id: 'm-1', name: 'Singer Heavy Duty S1', type: 'sewing', status: 'active', assignedWorker: 'Kamal' },
    { id: 'm-2', name: 'Juki Industrial S2', type: 'sewing', status: 'active', assignedWorker: 'Nimal' },
    { id: 'm-3', name: 'Brother Lockstitch S3', type: 'sewing', status: 'idle', assignedWorker: 'None' },
    { id: 'm-4', name: 'Eastman Straight Knife C1', type: 'cutting', status: 'active', assignedWorker: 'Nimal' }
  ],
  workers: [
    { id: 'w-1', name: 'Kamal', status: 'active', completedZippers: 120 },
    { id: 'w-2', name: 'Nimal', status: 'active', completedZippers: 95 }
  ]
};

// --- State Class Manager ---
class AppState {
  constructor() {
    this.data = this.load();
  }

  load() {
    const raw = localStorage.getItem('zipperflow_state');
    if (!raw) {
      this.save(DEFAULT_STATE);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    return JSON.parse(raw);
  }

  save(data = this.data) {
    localStorage.setItem('zipperflow_state', JSON.stringify(data));
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

const stateManager = new AppState();

// --- Material Consumption Logic ---
// Given standard parameters: cloth width is 3 inches. 
// Standard lengths: 36, 48, 54, 72 inches. 
// Conversion: length of roll consumed = zipper length.
// We convert inches to meters: inches * 0.0254
function calculateMaterialsRequired(zipperType, quantity) {
  const lengthInches = parseInt(zipperType, 10);
  const lengthMeters = parseFloat(((lengthInches * quantity) * 0.0254).toFixed(2));
  return {
    cloth: lengthMeters,
    zipper: lengthMeters,
    sliders: quantity
  };
}

// ==========================================================================
// VIEWS RENDER ENGINE
// ==========================================================================

const Views = {
  // ------------------------------------------------------------------------
  // LANDING VIEW
  // ------------------------------------------------------------------------
  landing: {
    render() {
      // Calculate average savings estimation
      const html = `
        <div class="landing-hero">
          <div class="hero-text">
            <h1>Precision Sewing for <span>Mattress Zippers</span></h1>
            <p>We are a dedicated zipper assembly workshop specializing in contract sewing for mattress manufacturers. Provide us the rolls of cloth, zipper tapes, and sliders—we deliver high-quality, perfectly sewed borders back to your production floor.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" id="landing-admin-btn">
                Access Shop Console
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </button>
              <button class="btn btn-outline" id="landing-calc-scroll">
                Cost Estimator
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <div class="hero-graphic">
            <div class="zipper-animation-box">
              <div class="zipper-line">
                <div class="zipper-teeth"></div>
                <div class="zipper-slider-mock"></div>
              </div>
              <div style="margin-top:20px; font-weight:600; font-size:0.85rem; letter-spacing:1px; color:var(--text-muted);">ZIPPERFLOW WORKSHOP</div>
            </div>
          </div>
        </div>

        <section class="landing-section">
          <div class="section-header">
            <h2>Our Workshop Capacity</h2>
            <p>Built for rapid, reliable turnaround of industrial volume contract zipper sewing.</p>
          </div>
          <div class="capacity-cards">
            <div class="capacity-card">
              <div class="card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <h3>Production Line</h3>
              <p>Equipped with 3 professional heavy-duty sewing machines and 1 fabric cutting machine for bulk loads.</p>
            </div>
            <div class="capacity-card">
              <div class="card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Skilled Tailors</h3>
              <p>Operated by 2 dedicated expert artisans ensuring top-notch lockstitch quality for every mattress perimeter.</p>
            </div>
            <div class="capacity-card">
              <div class="card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
              </div>
              <h3>Rented Shop Workspace</h3>
              <p>Optimized workspace arrangement with dedicated material storage racks and streamlined cutting tables.</p>
            </div>
          </div>
        </section>

        <section class="landing-section" id="cost-estimator-section">
          <div class="section-header">
            <h2>Instant Work Order Estimator</h2>
            <p>Simulate order costs and material requirements instantly.</p>
          </div>
          <div style="max-width: 600px; margin: 0 auto;" class="card-panel">
            <div class="form-group">
              <label for="est-size">Zipper Type (Length)</label>
              <select id="est-size" class="input-field">
                <option value="36">36 Inches (Standard Twin)</option>
                <option value="48">48 Inches (Three-Quarter)</option>
                <option value="54" selected>54 Inches (Full Size)</option>
                <option value="72">72 Inches (King Size)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="est-qty">Order Quantity</label>
              <input type="number" id="est-qty" class="input-field" value="100" min="1">
            </div>
            <div style="margin-top:24px; padding:16px; background-color:var(--bg-input); border-radius:8px; border:1px solid var(--border-color);">
              <h4 style="margin-bottom:12px; font-weight:600;">Estimated Cost & Materials:</h4>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
                <span class="text-muted">Total Order Value:</span>
                <span style="font-weight:700; color:var(--success);" id="est-res-val">Rs. 0.00</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
                <span class="text-muted">Cloth Roll Length Needed:</span>
                <span style="font-weight:600;" id="est-res-cloth">0.00 meters</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
                <span class="text-muted">Zipper Tape Needed:</span>
                <span style="font-weight:600;" id="est-res-zipper">0.00 meters</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                <span class="text-muted">Sliders Needed:</span>
                <span style="font-weight:600;" id="est-res-sliders">0 sliders</span>
              </div>
            </div>
          </div>
        </section>

        <section class="landing-section">
          <div class="section-header">
            <h2>Our Operational Flow</h2>
            <p>From client materials to finished mattress zippers.</p>
          </div>
          <div class="flow-diagram">
            <div class="flow-grid">
              <div class="flow-node">
                <h4>1. Material Intake</h4>
                <p>Mattress supplier provides Cloth Rolls, Zipper Coils, and Sliders.</p>
              </div>
              <div class="flow-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <div class="flow-node">
                <h4>2. Cutting Room</h4>
                <p>Cloth is cut to 3" strips; zipper coils measured to length.</p>
              </div>
              <div class="flow-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <div class="flow-node">
                <h4>3. Sewing Machine Line</h4>
                <p>Heavy duty sewing, sliders fitted, borders lockstitched.</p>
              </div>
              <div class="flow-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <div class="flow-node">
                <h4>4. Completed Delivery</h4>
                <p>Quality check, packing, and returning back to mattress factory.</p>
              </div>
            </div>
          </div>
        </section>
      `;

      const view = document.getElementById('view-landing');
      view.innerHTML = html;

      // Event listener for admin portal buttons
      document.getElementById('landing-admin-btn').addEventListener('click', () => {
        navigateTo('dashboard');
      });
      document.getElementById('landing-calc-scroll').addEventListener('click', () => {
        document.getElementById('cost-estimator-section').scrollIntoView({ behavior: 'smooth' });
      });

      // Interactive calculations
      const estSize = document.getElementById('est-size');
      const estQty = document.getElementById('est-qty');
      const calculateEstimate = () => {
        const size = estSize.value;
        const qty = parseInt(estQty.value, 10) || 0;
        const state = stateManager.data;
        const price = state.pricing[size] || 0;
        const totalCost = price * qty;
        
        const mats = calculateMaterialsRequired(size, qty);

        document.getElementById('est-res-val').innerText = `Rs. ${totalCost.toLocaleString()}`;
        document.getElementById('est-res-cloth').innerText = `${mats.cloth} meters`;
        document.getElementById('est-res-zipper').innerText = `${mats.zipper} meters`;
        document.getElementById('est-res-sliders').innerText = `${mats.sliders} sliders`;
      };

      estSize.addEventListener('change', calculateEstimate);
      estQty.addEventListener('input', calculateEstimate);
      calculateEstimate();
    }
  },

  // ------------------------------------------------------------------------
  // DASHBOARD VIEW
  // ------------------------------------------------------------------------
  dashboard: {
    render() {
      const state = stateManager.data;

      // 1. Calculate financials
      let totalRevenue = 0;
      let totalZippersSewn = 0;
      state.orders.forEach(order => {
        if (order.status === 'completed') {
          const price = state.pricing[order.zipperType] || 0;
          totalRevenue += price * order.quantity;
          totalZippersSewn += order.quantity;
        }
      });

      let totalExpenses = 0;
      state.expenses.forEach(exp => {
        totalExpenses += exp.amount;
      });

      const netProfit = totalRevenue - totalExpenses;

      // 2. Formulate Low Stock warnings
      let lowStockAlerts = [];
      if (state.inventory.cloth <= state.thresholds.cloth) lowStockAlerts.push(`Cloth (${state.inventory.cloth}m left)`);
      if (state.inventory.zipper <= state.thresholds.zipper) lowStockAlerts.push(`Zipper Tape (${state.inventory.zipper}m left)`);
      if (state.inventory.sliders <= state.thresholds.sliders) lowStockAlerts.push(`Sliders (${state.inventory.sliders} pcs left)`);

      // 3. Render HTML template
      const html = `
        <div class="view-header">
          <div>
            <h2>Dashboard</h2>
            <div class="header-subtitle">Workshop operation overview & summary logs</div>
          </div>
        </div>

        <!-- Low Stock Warning Banner -->
        ${lowStockAlerts.length > 0 ? `
          <div class="warning-panel">
            <div class="warning-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="warning-text">
              <h4>Low Stock Alert!</h4>
              <p>The following items are running below minimum thresholds: <strong class="text-danger">${lowStockAlerts.join(', ')}</strong>. Consider restocking soon.</p>
            </div>
          </div>
        ` : ''}

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-details">
              <p>Zippers Sewn</p>
              <div class="metric-number">${totalZippersSewn.toLocaleString()}</div>
              <span class="metric-trend trend-up">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><polyline points="18 15 12 9 6 15"/></svg>
                Delivered
              </span>
            </div>
            <div class="metric-icon-wrap" style="color: var(--accent);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-details">
              <p>Total Revenue</p>
              <div class="metric-number">Rs. ${totalRevenue.toLocaleString()}</div>
              <span class="metric-trend trend-up">Earned</span>
            </div>
            <div class="metric-icon-wrap" style="color: var(--success);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-details">
              <p>Expenditures</p>
              <div class="metric-number">Rs. ${totalExpenses.toLocaleString()}</div>
              <span class="metric-trend trend-down">Spent</span>
            </div>
            <div class="metric-icon-wrap" style="color: var(--danger);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-details">
              <p>Net Profits</p>
              <div class="metric-number ${netProfit >= 0 ? 'text-success' : 'text-danger'}">Rs. ${netProfit.toLocaleString()}</div>
              <span class="metric-trend ${netProfit >= 0 ? 'trend-up' : 'trend-down'}">${netProfit >= 0 ? 'Surplus' : 'Deficit'}</span>
            </div>
            <div class="metric-icon-wrap" style="color: var(--secondary);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/></svg>
            </div>
          </div>
        </div>

        <!-- Dashboard Core Split Layout -->
        <div class="dashboard-grid">
          <!-- Charts Section -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Financial Analysis</h3>
              <div class="status-indicator">
                <span class="indicator-dot online"></span>
                <span>Visual ledger</span>
              </div>
            </div>
            <div class="chart-container" id="revenue-chart-wrap">
              <!-- SVG chart gets injected here -->
            </div>
          </div>

          <!-- Active & Recent Orders -->
          <div class="recent-orders-card">
            <div class="chart-header" style="margin-bottom:12px;">
              <h3>Active Work Orders</h3>
            </div>
            <div class="recent-orders-list">
              ${state.orders.filter(o => o.status !== 'completed').length === 0 ? `
                <div style="text-align:center; padding:40px; color:var(--text-muted); font-size:0.9rem;">
                  No active orders right now.
                </div>
              ` : state.orders.filter(o => o.status !== 'completed').map(order => `
                <div class="order-item-mini">
                  <div class="order-info-mini">
                    <h5>${order.clientName} (${order.zipperType}")</h5>
                    <p>Qty: ${order.quantity} | Created: ${order.dateCreated}</p>
                  </div>
                  <span class="order-badge-status badge-${order.status}">${order.status.toUpperCase()}</span>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-outline" style="width:100%; justify-content:center; margin-top:16px; font-size:0.8rem; padding:8px;" id="dash-view-all-orders">
              Manage Orders & Inventory
            </button>
          </div>
        </div>
      `;

      const view = document.getElementById('view-dashboard');
      view.innerHTML = html;

      // Bind button to view orders
      document.getElementById('dash-view-all-orders').addEventListener('click', () => {
        navigateTo('inventory');
      });

      // Inject the dynamic financial comparison chart
      this.renderSVGChart(totalRevenue, totalExpenses, netProfit);
    },

    renderSVGChart(revenue, expenses, profit) {
      const container = document.getElementById('revenue-chart-wrap');
      if (!container) return;

      const maxVal = Math.max(revenue, expenses, Math.abs(profit), 10000);
      const scale = (val) => (val / maxVal) * 160; // scale values to max 160px height

      const revH = scale(revenue);
      const expH = scale(expenses);
      const profH = scale(Math.max(0, profit));

      const svgHtml = `
        <svg class="svg-chart" viewBox="0 0 400 240">
          <defs>
            <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--success)" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="var(--success)" stop-opacity="0.2"/>
            </linearGradient>
            <linearGradient id="expenses-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--danger)" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="var(--danger)" stop-opacity="0.2"/>
            </linearGradient>
            <linearGradient id="profit-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
          
          <!-- Grid lines -->
          <line x1="40" y1="40" x2="360" y2="40" class="chart-axis" stroke-dasharray="3 3"/>
          <line x1="40" y1="120" x2="360" y2="120" class="chart-axis" stroke-dasharray="3 3"/>
          <line x1="40" y1="200" x2="360" y2="200" class="chart-axis"/>
          
          <!-- Bar 1 (Revenue) -->
          <rect x="70" y="${200 - revH}" width="50" height="${revH}" rx="6" fill="url(#revenue-grad)" class="chart-bar"/>
          <text x="95" y="220" text-anchor="middle" class="chart-text">Revenue</text>
          <text x="95" y="${190 - revH}" text-anchor="middle" fill="var(--success)" font-weight="700" font-size="11">Rs. ${revenue.toLocaleString()}</text>

          <!-- Bar 2 (Expenses) -->
          <rect x="175" y="${200 - expH}" width="50" height="${expH}" rx="6" fill="url(#expenses-grad)" class="chart-bar"/>
          <text x="200" y="220" text-anchor="middle" class="chart-text">Expenses</text>
          <text x="200" y="${190 - expH}" text-anchor="middle" fill="var(--danger)" font-weight="700" font-size="11">Rs. ${expenses.toLocaleString()}</text>

          <!-- Bar 3 (Net Profit) -->
          <rect x="280" y="${200 - profH}" width="50" height="${profH}" rx="6" fill="url(#profit-grad)" class="chart-bar"/>
          <text x="305" y="220" text-anchor="middle" class="chart-text">Net Profit</text>
          <text x="305" y="${190 - profH}" text-anchor="middle" fill="var(--primary)" font-weight="700" font-size="11">Rs. ${profit.toLocaleString()}</text>
        </svg>
      `;
      container.innerHTML = svgHtml;
    }
  },

  // ------------------------------------------------------------------------
  // INVENTORY VIEW
  // ------------------------------------------------------------------------
  inventory: {
    render() {
      const state = stateManager.data;

      // 1. Calculate stock percentages
      const maxStockEstimate = 500; // Reference maximum for visually rendering bounds
      const clothPct = Math.min(100, (state.inventory.cloth / maxStockEstimate) * 100);
      const zipperPct = Math.min(100, (state.inventory.zipper / maxStockEstimate) * 100);
      const slidersPct = Math.min(100, (state.inventory.sliders / maxStockEstimate) * 100);

      // Status checkers
      const isClothLow = state.inventory.cloth <= state.thresholds.cloth;
      const isZipperLow = state.inventory.zipper <= state.thresholds.zipper;
      const isSlidersLow = state.inventory.sliders <= state.thresholds.sliders;

      const html = `
        <div class="view-header">
          <div>
            <h2>Inventory Management</h2>
            <div class="header-subtitle">Track raw materials given by mattress companies</div>
          </div>
        </div>

        <!-- Inventory Balance Cards -->
        <div class="inventory-stock-grid">
          <div class="stock-card cloth ${isClothLow ? 'low-stock' : ''}">
            <div class="stock-header">
              <span class="stock-title">Roll of Cloth</span>
              ${isClothLow ? '<span class="stock-status-alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Low</span>' : '<span style="font-size:0.75rem;color:var(--success);font-weight:600;">Good</span>'}
            </div>
            <div class="stock-quantity">${state.inventory.cloth} <span class="stock-unit">meters</span></div>
            <div class="stock-progress-bg">
              <div class="stock-progress-bar" style="width: ${clothPct}%"></div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Warning threshold: ${state.thresholds.cloth}m</div>
          </div>

          <div class="stock-card zipper ${isZipperLow ? 'low-stock' : ''}">
            <div class="stock-header">
              <span class="stock-title">Zipper Coil</span>
              ${isZipperLow ? '<span class="stock-status-alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Low</span>' : '<span style="font-size:0.75rem;color:var(--success);font-weight:600;">Good</span>'}
            </div>
            <div class="stock-quantity">${state.inventory.zipper} <span class="stock-unit">meters</span></div>
            <div class="stock-progress-bg">
              <div class="stock-progress-bar" style="width: ${zipperPct}%"></div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Warning threshold: ${state.thresholds.zipper}m</div>
          </div>

          <div class="stock-card sliders ${isSlidersLow ? 'low-stock' : ''}">
            <div class="stock-header">
              <span class="stock-title">Zipper Sliders</span>
              ${isSlidersLow ? '<span class="stock-status-alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Low</span>' : '<span style="font-size:0.75rem;color:var(--success);font-weight:600;">Good</span>'}
            </div>
            <div class="stock-quantity">${state.inventory.sliders} <span class="stock-unit">pcs</span></div>
            <div class="stock-progress-bg">
              <div class="stock-progress-bar" style="width: ${slidersPct}%"></div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Warning threshold: ${state.thresholds.sliders} pcs</div>
          </div>
        </div>

        <div class="split-layout" style="margin-bottom: 32px;">
          <!-- Left: Add Materials Form -->
          <div class="card-panel">
            <h3>Log Inbound Materials</h3>
            <form id="add-material-form">
              <div class="form-group">
                <label for="mat-type">Material Type</label>
                <select id="mat-type" class="input-field">
                  <option value="cloth">Roll of Cloth (meters)</option>
                  <option value="zipper">Zipper Coil (meters)</option>
                  <option value="sliders">Zipper Sliders (pieces)</option>
                </select>
              </div>
              <div class="form-group">
                <label for="mat-qty">Inbound Quantity</label>
                <input type="number" id="mat-qty" class="input-field" value="50" min="1" required>
              </div>
              <div class="form-group">
                <label for="mat-notes">Notes / Consigner Co.</label>
                <input type="text" id="mat-notes" class="input-field" placeholder="e.g. Received from SleepSoft Co." required>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;">
                Record Delivery
              </button>
            </form>
          </div>

          <!-- Right: Inbound Delivery Logs -->
          <div class="card-panel" style="display:flex; flex-direction:column; overflow:hidden;">
            <h3>Inbound Delivery Records</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.inboundLogs.length === 0 ? `
                    <tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No inbound delivery logs.</td></tr>
                  ` : state.inboundLogs.map(log => `
                    <tr>
                      <td>${log.date}</td>
                      <td><span style="font-weight:600;">${log.type.toUpperCase()}</span></td>
                      <td>${log.quantity} ${log.type === 'sliders' ? 'pcs' : 'm'}</td>
                      <td>${log.notes}</td>
                      <td>
                        <button class="btn-icon delete" onclick="deleteInboundLog('${log.id}')" title="Delete Log">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Orders Pipeline Panel -->
        <div class="card-panel" style="margin-bottom: 28px;">
          <div class="action-bar">
            <h3>Work Orders & Production Pipeline</h3>
            <button class="btn btn-primary" id="open-new-order-modal">
              Create Work Order
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Client Name</th>
                  <th>Zipper Size</th>
                  <th>Quantity</th>
                  <th>Material Cost (Estimate)</th>
                  <th>Status</th>
                  <th>Status Action</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                ${state.orders.length === 0 ? `
                  <tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No orders recorded yet.</td></tr>
                ` : state.orders.map(order => {
                  const reqs = calculateMaterialsRequired(order.zipperType, order.quantity);
                  const price = state.pricing[order.zipperType] || 0;
                  const totalVal = price * order.quantity;
                  
                  return `
                    <tr>
                      <td><span style="font-family:var(--font-heading);font-weight:700;">${order.orderNumber}</span></td>
                      <td>${order.clientName}</td>
                      <td>${order.zipperType} Inches</td>
                      <td>${order.quantity} pcs</td>
                      <td>
                        <div style="font-size:0.8rem;">
                          Cloth: ${reqs.cloth}m | Zip: ${reqs.zipper}m | Sliders: ${reqs.sliders}
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                          Order Value: Rs. ${totalVal.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span class="order-badge-status badge-${order.status}">${order.status.toUpperCase()}</span>
                      </td>
                      <td>
                        <select class="input-field" style="padding:4px 8px; width:auto; font-size:0.8rem;" onchange="updateOrderStatus('${order.id}', this.value)">
                          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                          <option value="cutting" ${order.status === 'cutting' ? 'selected' : ''}>Cutting</option>
                          <option value="sewing" ${order.status === 'sewing' ? 'selected' : ''}>Sewing</option>
                          <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready for Delivery</option>
                          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed & Invoiced</option>
                        </select>
                      </td>
                      <td>
                        <button class="btn-icon delete" onclick="deleteOrder('${order.id}')" title="Delete Order">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Custom Order Modal Wrapper (Hidden by default, shown by CSS block inject) -->
        <div id="new-order-modal" class="modal-backdrop hidden">
          <div class="modal-card card-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="margin:0;">Create New Work Order</h3>
              <button class="btn-icon" id="close-order-modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form id="new-order-form">
              <div class="form-group">
                <label for="ord-client">Mattress Company / Client Name</label>
                <input type="text" id="ord-client" class="input-field" placeholder="e.g. DreamLine Mattresses" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="ord-size">Zipper Type (Length)</label>
                  <select id="ord-size" class="input-field">
                    <option value="36">36 Inches</option>
                    <option value="48">48 Inches</option>
                    <option value="54">54 Inches</option>
                    <option value="72">72 Inches</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="ord-qty">Quantity</label>
                  <input type="number" id="ord-qty" class="input-field" value="50" min="1" required>
                </div>
              </div>
              <div class="form-group">
                <label for="ord-notes">Special Instructions</label>
                <input type="text" id="ord-notes" class="input-field" placeholder="e.g. Red zipper slider required">
              </div>
              <div style="display:flex; gap:12px; margin-top:20px;">
                <button type="button" class="btn btn-outline" style="flex:1; justify-content:center;" id="cancel-order-modal">Cancel</button>
                <button type="submit" class="btn btn-primary" style="flex:1; justify-content:center;">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      `;

      const view = document.getElementById('view-inventory');
      view.innerHTML = html;

      // Event listener for adding materials
      document.getElementById('add-material-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('mat-type').value;
        const qty = parseFloat(document.getElementById('mat-qty').value);
        const notes = document.getElementById('mat-notes').value;
        
        state.inventory[type] += qty;
        
        const newLog = {
          id: `in-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type,
          quantity: qty,
          notes
        };

        state.inboundLogs.unshift(newLog);
        stateManager.save();
        this.render(); // Refreshes view
      });

      // Modal Triggers
      const modal = document.getElementById('new-order-modal');
      document.getElementById('open-new-order-modal').addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // override css hidden layout
      });

      const hideModal = () => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      };

      document.getElementById('close-order-modal').addEventListener('click', hideModal);
      document.getElementById('cancel-order-modal').addEventListener('click', hideModal);

      document.getElementById('new-order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = document.getElementById('ord-client').value;
        const zipperType = document.getElementById('ord-size').value;
        const quantity = parseInt(document.getElementById('ord-qty').value, 10);
        const notes = document.getElementById('ord-notes').value;

        // Generate Order number
        const nextNum = 1001 + state.orders.length;
        const newOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: `ORD-${nextNum}`,
          clientName,
          zipperType,
          quantity,
          status: 'pending',
          dateCreated: new Date().toISOString().split('T')[0],
          dateCompleted: '',
          inventoryDeducted: false,
          notes
        };

        state.orders.push(newOrder);
        stateManager.save();
        hideModal();
        this.render();
      });
    }
  },

  // ------------------------------------------------------------------------
  // ACCOUNTING VIEW
  // ------------------------------------------------------------------------
  accounting: {
    render() {
      const state = stateManager.data;

      // 1. Compile Ledger Transactions
      // Ledger combines revenues (automatically from completed orders) and expenses (manually inputted)
      let ledger = [];

      state.orders.forEach(order => {
        if (order.status === 'completed') {
          const price = state.pricing[order.zipperType] || 0;
          const revenue = price * order.quantity;
          ledger.push({
            id: order.id,
            date: order.dateCompleted || order.dateCreated,
            description: `Revenue: ${order.orderNumber} - ${order.clientName} (${order.quantity} pcs of ${order.zipperType}")`,
            type: 'revenue',
            amount: revenue
          });
        }
      });

      state.expenses.forEach(exp => {
        ledger.push({
          id: exp.id,
          date: exp.date,
          description: `Expense: [${exp.category}] - ${exp.notes}`,
          type: 'expense',
          amount: exp.amount
        });
      });

      // Sort ledger by date descending
      ledger.sort((a, b) => new Date(b.date) - new Date(a.date));

      const totalRevenue = ledger.filter(l => l.type === 'revenue').reduce((sum, l) => sum + l.amount, 0);
      const totalExpenses = ledger.filter(l => l.type === 'expense').reduce((sum, l) => sum + l.amount, 0);
      const netProfit = totalRevenue - totalExpenses;

      const html = `
        <div class="view-header">
          <div>
            <h2>Accounting Management</h2>
            <div class="header-subtitle">Edit pricing, track business expenditures and check net margins</div>
          </div>
        </div>

        <!-- Editable Pricing Setup -->
        <div class="pricing-config">
          <h3 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:600;">Pricing List per Zipper Size</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Adjust the processing fee earned per finished zipper (Rs.)</p>
          
          <div class="pricing-config-grid">
            <div class="price-box">
              <label>36 Inch Zipper Price</label>
              <div class="price-input-wrap">
                <span class="price-currency">Rs.</span>
                <input type="number" class="price-input" data-size="36" value="${state.pricing['36']}">
              </div>
            </div>
            <div class="price-box">
              <label>48 Inch Zipper Price</label>
              <div class="price-input-wrap">
                <span class="price-currency">Rs.</span>
                <input type="number" class="price-input" data-size="48" value="${state.pricing['48']}">
              </div>
            </div>
            <div class="price-box">
              <label>54 Inch Zipper Price</label>
              <div class="price-input-wrap">
                <span class="price-currency">Rs.</span>
                <input type="number" class="price-input" data-size="54" value="${state.pricing['54']}">
              </div>
            </div>
            <div class="price-box">
              <label>72 Inch Zipper Price</label>
              <div class="price-input-wrap">
                <span class="price-currency">Rs.</span>
                <input type="number" class="price-input" data-size="72" value="${state.pricing['72']}">
              </div>
            </div>
          </div>
        </div>

        <div class="split-layout">
          <!-- Left Form: Add Expense -->
          <div class="card-panel">
            <h3>Log Expenditure</h3>
            <form id="add-expense-form">
              <div class="form-group">
                <label for="exp-cat">Expense Category</label>
                <select id="exp-cat" class="input-field">
                  <option value="Rent">Shop Rent</option>
                  <option value="Salary">Salaries & Wages</option>
                  <option value="Electricity">Electricity & Utilities</option>
                  <option value="Maintenance">Machine Repair / Needles</option>
                  <option value="Thread & Accessories">Thread & Thread cones</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
              </div>
              <div class="form-group">
                <label for="exp-amount">Amount (Rs.)</label>
                <input type="number" id="exp-amount" class="input-field" placeholder="1000" min="1" required>
              </div>
              <div class="form-group">
                <label for="exp-notes">Specific Notes</label>
                <input type="text" id="exp-notes" class="input-field" placeholder="e.g. Electricity bill for May" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;">
                Record Expense
              </button>
            </form>
          </div>

          <!-- Right Table: General Ledger -->
          <div class="card-panel" style="display:flex; flex-direction:column; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h3 style="margin:0;">General Ledger</h3>
              <div style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">
                Net: <span class="${netProfit >= 0 ? 'text-success' : 'text-danger'}">Rs. ${netProfit.toLocaleString()}</span>
              </div>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${ledger.length === 0 ? `
                    <tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No ledger transactions logged.</td></tr>
                  ` : ledger.map(l => `
                    <tr>
                      <td>${l.date}</td>
                      <td>${l.description}</td>
                      <td>
                        <span class="order-badge-status badge-${l.type === 'revenue' ? 'completed' : 'pending'}">${l.type.toUpperCase()}</span>
                      </td>
                      <td class="${l.type === 'revenue' ? 'text-success' : 'text-danger'}" style="font-weight:700;">
                        ${l.type === 'revenue' ? '+' : '-'} Rs. ${l.amount.toLocaleString()}
                      </td>
                      <td>
                        ${l.type === 'expense' ? `
                          <button class="btn-icon delete" onclick="deleteExpense('${l.id}')" title="Delete Expense">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        ` : '<span style="font-size:0.75rem;color:var(--text-muted);">Order Synced</span>'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      const view = document.getElementById('view-accounting');
      view.innerHTML = html;

      // Event listener for price updates
      const priceInputs = document.querySelectorAll('.price-input');
      priceInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const size = e.target.getAttribute('data-size');
          const value = parseFloat(e.target.value) || 0;
          state.pricing[size] = value;
          stateManager.save();
        });
      });

      // Event listener for logging expense
      document.getElementById('add-expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('exp-cat').value;
        const amount = parseFloat(document.getElementById('exp-amount').value);
        const notes = document.getElementById('exp-notes').value;

        const newExp = {
          id: `exp-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          category,
          amount,
          notes
        };

        state.expenses.unshift(newExp);
        stateManager.save();
        this.render();
      });
    }
  },

  // ------------------------------------------------------------------------
  // WORKSHOP VIEW
  // ------------------------------------------------------------------------
  workshop: {
    render() {
      const state = stateManager.data;

      const html = `
        <div class="view-header">
          <div>
            <h2>Workshop Capacity & Assets</h2>
            <div class="header-subtitle">Manage machine statuses and tailors production levels</div>
          </div>
        </div>

        <div class="workshop-grid">
          <!-- Left Side: Machinery Asset States -->
          <div class="card-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="margin:0;">Machinery Status</h3>
              <div style="font-size:0.75rem; color:var(--text-muted);">3 Sewing Machines | 1 Cutting Machine</div>
            </div>
            
            <div class="machine-grid">
              ${state.machines.map(m => `
                <div class="machine-card ${m.status}">
                  <div class="machine-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  </div>
                  <h4>${m.name}</h4>
                  <p style="font-size:0.75rem; color:var(--text-muted); text-transform:capitalize;">Type: ${m.type}</p>
                  
                  <select class="machine-status-select" onchange="updateMachineStatus('${m.id}', this.value)">
                    <option value="active" ${m.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="idle" ${m.status === 'idle' ? 'selected' : ''}>Idle</option>
                    <option value="maintenance" ${m.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                  </select>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Side: Workers Performance Tracker -->
          <div class="card-panel">
            <h3 style="margin-bottom:20px;">Staff & Tailor Productivity</h3>
            <div class="worker-list">
              ${state.workers.map(w => `
                <div class="worker-card">
                  <div class="worker-identity">
                    <div class="worker-avatar">${w.name.substring(0,2).toUpperCase()}</div>
                    <div class="worker-details">
                      <h4>${w.name}</h4>
                      <p>Status: <span style="color:var(--success); font-weight:600;">${w.name === 'Kamal' || w.name === 'Nimal' ? 'On Shift' : 'Leave'}</span></p>
                    </div>
                  </div>
                  <div class="worker-stat-badge">
                    <div class="worker-stat-val">${w.completedZippers}</div>
                    <div class="worker-stat-lbl">Zippers Sewn</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="margin-top:28px; padding:16px; background-color:var(--bg-input); border-radius:10px; border:1px solid var(--border-color); font-size:0.8rem; line-height:1.5; color:var(--text-muted);">
              <h5 style="margin-bottom:6px; color:var(--text-main); font-weight:600;">Rented Shop capacity info:</h5>
              Our shop processes orders concurrently by dividing workloads between our 2 master tailors. Keeping track of machine downtime helps schedule preventive maintenance before big mattress contracts arrive.
            </div>
          </div>
        </div>
      `;

      const view = document.getElementById('view-workshop');
      view.innerHTML = html;
    }
  }
};

// ==========================================================================
// CORE PIPELINE CONTROLLER ACTIONS (Bound globally for simple inline triggers)
// ==========================================================================

// 1. Delete Inbound Log
window.deleteInboundLog = function(id) {
  const state = stateManager.data;
  const idx = state.inboundLogs.findIndex(log => log.id === id);
  if (idx !== -1) {
    const log = state.inboundLogs[idx];
    // Deduct stock balance that was added by this log
    state.inventory[log.type] = Math.max(0, state.inventory[log.type] - log.quantity);
    state.inboundLogs.splice(idx, 1);
    stateManager.save();
    Views.inventory.render();
  }
};

// 2. Delete Expense Log
window.deleteExpense = function(id) {
  const state = stateManager.data;
  const idx = state.expenses.findIndex(exp => exp.id === id);
  if (idx !== -1) {
    state.expenses.splice(idx, 1);
    stateManager.save();
    Views.accounting.render();
  }
};

// 3. Delete Order
window.deleteOrder = function(id) {
  const state = stateManager.data;
  const idx = state.orders.findIndex(ord => ord.id === id);
  if (idx !== -1) {
    const order = state.orders[idx];
    // If materials were deducted, return them back to inventory!
    if (order.inventoryDeducted) {
      const mats = calculateMaterialsRequired(order.zipperType, order.quantity);
      state.inventory.cloth += mats.cloth;
      state.inventory.zipper += mats.zipper;
      state.inventory.sliders += mats.sliders;
    }
    state.orders.splice(idx, 1);
    stateManager.save();
    Views.inventory.render();
  }
};

// 4. Update Machine Status
window.updateMachineStatus = function(id, val) {
  const state = stateManager.data;
  const idx = state.machines.findIndex(m => m.id === id);
  if (idx !== -1) {
    state.machines[idx].status = val;
    stateManager.save();
    Views.workshop.render();
  }
};

// 5. Update Order Status & Deduct/Refund Materials
window.updateOrderStatus = function(id, status) {
  const state = stateManager.data;
  const idx = state.orders.findIndex(ord => ord.id === id);
  if (idx === -1) return;

  const order = state.orders[idx];
  const oldStatus = order.status;
  order.status = status;

  // Track dates
  if (status === 'completed' && oldStatus !== 'completed') {
    order.dateCompleted = new Date().toISOString().split('T')[0];
    
    // Add completed zippers to workers to simulate work sharing
    if (state.workers.length > 0) {
      // Divide workload between the two workers
      const wIdx = Math.floor(Math.random() * state.workers.length);
      state.workers[wIdx].completedZippers += order.quantity;
    }
  } else if (status !== 'completed') {
    order.dateCompleted = '';
  }

  // Material Deduction System:
  // We deduct materials if the status transitions out of 'pending' (into cutting, sewing, ready, or completed)
  // and we haven't already deducted materials.
  const needsDeduction = (status !== 'pending');
  
  if (needsDeduction && !order.inventoryDeducted) {
    const mats = calculateMaterialsRequired(order.zipperType, order.quantity);
    state.inventory.cloth = parseFloat((state.inventory.cloth - mats.cloth).toFixed(2));
    state.inventory.zipper = parseFloat((state.inventory.zipper - mats.zipper).toFixed(2));
    state.inventory.sliders -= mats.sliders;
    order.inventoryDeducted = true;
  } else if (!needsDeduction && order.inventoryDeducted) {
    // If order moved back to pending, refund materials
    const mats = calculateMaterialsRequired(order.zipperType, order.quantity);
    state.inventory.cloth = parseFloat((state.inventory.cloth + mats.cloth).toFixed(2));
    state.inventory.zipper = parseFloat((state.inventory.zipper + mats.zipper).toFixed(2));
    state.inventory.sliders += mats.sliders;
    order.inventoryDeducted = false;
  }

  stateManager.save();
  Views.inventory.render();
};


// ==========================================================================
// SPA VIEW NAVIGATION ROUTER
// ==========================================================================

function navigateTo(target) {
  // Hide all views
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.add('hidden');
    view.classList.remove('active');
  });

  // Show target view
  const activeView = document.getElementById(`view-${target}`);
  if (activeView) {
    activeView.classList.remove('hidden');
    activeView.classList.add('active');
  }

  // Render view template
  if (Views[target]) {
    Views[target].render();
  }

  // Sync Nav item highlights (Desktop Sidebar)
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-target') === target) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Sync Nav item highlights (Mobile Bottom Nav)
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    if (btn.getAttribute('data-target') === target) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Close sidebar on mobile after navigating
  document.getElementById('sidebar').classList.remove('menu-open');
}

// Bind Navigation Triggers
document.addEventListener('DOMContentLoaded', () => {
  // Bind sidebar and bottom-bar click handlers
  const navButtons = document.querySelectorAll('.nav-item, .bottom-nav-item, .portal-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-target');
      if (target) navigateTo(target);
    });
  });

  // Mobile menu toggle hamburger menu
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('menu-open');
  });

  // Close sidebar if user clicks outside of it on mobile
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('menu-open')) {
      sidebar.classList.remove('menu-open');
    }
  });

  // Theme Toggler
  const themeToggle = document.getElementById('theme-toggle');
  const themeText = themeToggle.querySelector('.theme-text');
  
  // Set initial theme
  document.body.className = stateManager.data.theme || 'dark-theme';
  themeText.innerText = document.body.classList.contains('dark-theme') ? 'Light Mode' : 'Dark Mode';

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light-theme' : 'dark-theme';
    
    document.body.className = newTheme;
    stateManager.data.theme = newTheme;
    stateManager.save();
    
    themeText.innerText = isDark ? 'Dark Mode' : 'Light Mode';
    
    // Rerender active page to pick up styling updates
    const activeBtn = document.querySelector('.nav-item.active');
    if (activeBtn) {
      const target = activeBtn.getAttribute('data-target');
      if (Views[target]) Views[target].render();
    }
  });

  // Hide page loader with delay for premium feel
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('fade-out');
  }, 600);

  // Load initial view
  navigateTo('landing');
});
