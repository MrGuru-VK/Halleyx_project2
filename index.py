INDEX_TEMPLATE='''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halleyx Dashboard Builder</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
</head>
<body class="dashboard-shell">
    <div class="page-glow page-glow-one"></div>
    <div class="page-glow page-glow-two"></div>
    <div id="app" class="app-shell">
        <header class="topbar">
            <div class="brand-block">
                <span class="eyebrow">Halleyx Workspace</span>
                <h1>Custom Dashboard Builder</h1>
                <p>Build views, track orders, and shape data stories in one wider control room.</p>
            </div>
            <div class="topbar-actions">
                <button id="configureBtn" class="secondary-btn" type="button">Configure Dashboard</button>
                <button id="logoutBtn" class="ghost-btn" type="button">Logout</button>
            </div>
        </header>

        <main class="workspace-grid">
            <section id="dashboardView" class="panel workspace-panel">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow">Dashboard view</span>
                        <h2>Analytics Workspace</h2>
                    </div>
                    <div id="dateFilter" class="filter-bar">
                        <label>
                            <span>Start Date</span>
                            <input type="date" id="startDate">
                        </label>
                        <label>
                            <span>End Date</span>
                            <input type="date" id="endDate">
                        </label>
                        <button id="applyFilter" type="button">Apply</button>
                    </div>
                </div>
                <div id="dashboardCanvas" class="grid-container board-canvas">
                    <!-- Widgets will be appended here -->
                </div>
            </section>

            <section id="configView" class="panel workspace-panel hidden">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow">Builder mode</span>
                        <h2>Configuration Studio</h2>
                    </div>
                    <div class="inline-actions">
                        <button id="saveConfig" type="button">Save Configuration</button>
                        <button id="backToDashboard" class="secondary-btn" type="button">Back to Dashboard</button>
                    </div>
                </div>
                <div class="config-layout">
                    <aside id="widgetPalette" class="palette-panel">
                        <div class="palette-header">
                            <span class="eyebrow">Widget palette</span>
                            <h3>Drag blocks into the canvas</h3>
                        </div>
                        <div class="widget-item" draggable="true" data-type="kpi">KPI Card</div>
                        <div class="widget-item" draggable="true" data-type="bar">Bar Chart</div>
                        <div class="widget-item" draggable="true" data-type="line">Line Chart</div>
                        <div class="widget-item" draggable="true" data-type="area">Area Chart</div>
                        <div class="widget-item" draggable="true" data-type="scatter">Scatter Plot</div>
                        <div class="widget-item" draggable="true" data-type="pie">Pie Chart</div>
                        <div class="widget-item" draggable="true" data-type="table">Table</div>
                    </aside>
                    <div id="configCanvas" class="grid-container drop-zone board-canvas">
                        <!-- Drop widgets here -->
                    </div>
                </div>
            </section>

            <section id="ordersSection" class="panel orders-panel">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow">Commerce</span>
                        <h2>Customer Orders</h2>
                    </div>
                    <button id="createOrderBtn" type="button">Create Order</button>
                </div>
                <div class="table-wrap">
                    <table id="ordersTable">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Postal Code</th>
                                <th>Country</th>
                                <th>Order ID</th>
                                <th>Order Date</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Orders will be appended here -->
                        </tbody>
                    </table>
                </div>
            </section>
        </main>

        <div id="orderModal" class="modal hidden">
            <div class="modal-content wide-modal">
                <span class="close">&times;</span>
                <h2 id="modalTitle">Create Order</h2>
                <form id="orderForm" class="form-grid">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" name="lastName" required>
                    </div>
                    <div class="form-group">
                        <label>Email ID *</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="text" name="phone" required>
                    </div>
                    <div class="form-group form-group-span-2">
                        <label>Street Address *</label>
                        <input type="text" name="streetAddress" required>
                    </div>
                    <div class="form-group">
                        <label>City *</label>
                        <input type="text" name="city" required>
                    </div>
                    <div class="form-group">
                        <label>State / Province *</label>
                        <input type="text" name="state" required>
                    </div>
                    <div class="form-group">
                        <label>Postal Code *</label>
                        <input type="text" name="postalCode" required>
                    </div>
                    <div class="form-group">
                        <label>Country *</label>
                        <select name="country" required>
                            <option value="">Select</option>
                            <option>United States</option>
                            <option>Canada</option>
                            <option>Australia</option>
                            <option>Singapore</option>
                            <option>Hong Kong</option>
                            <option>India</option>
                            <option>Russia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Choose Product *</label>
                        <select name="product" required>
                            <option value="">Select</option>
                            <option>Fiber Internet 300 Mbps</option>
                            <option>5G Unlimited Mobile Plan</option>
                            <option>Fiber Internet 1 Gbps</option>
                            <option>Business Internet 500 Mbps</option>
                            <option>VoIP Corporate Package</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity *</label>
                        <input type="number" name="quantity" value="1" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Unit Price *</label>
                        <input type="number" name="unitPrice" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Total Amount</label>
                        <input type="number" name="totalAmount" readonly>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select name="status" required>
                            <option>Pending</option>
                            <option>In progress</option>
                            <option>Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Created By *</label>
                        <select name="createdBy" required>
                            <option value="">Select</option>
                            <option>Mr. Michael Harris</option>
                            <option>Mr. Ryan Cooper</option>
                            <option>Ms. Olivia Carter</option>
                            <option>Mr. Lucas Martin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Order Date *</label>
                        <input type="date" name="orderDate" required>
                    </div>
                    <div class="form-actions form-group-span-2">
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="widgetModal" class="modal hidden">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Configure Widget</h2>
                <form id="widgetForm" class="widget-config-form">
                    <!-- Dynamic form based on widget type -->
                </form>
            </div>
        </div>
    </div>
    <script src="/script.js"></script>
</body>
</html>'''

DASHBOARD_TEMPLATE = INDEX_TEMPLATE

LOGIN_TEMPLATE='''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Halleyx Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
</head>
<body class="login-shell">
    <div class="page-glow page-glow-one"></div>
    <div class="page-glow page-glow-two"></div>
    <main class="login-layout">
        <section class="login-intro">
            <span class="eyebrow">Halleyx Operations</span>
            <h1>Launch a sharper dashboard experience.</h1>
            <p>Sign in to access the upgraded workspace with a larger canvas, more polished cards, and a cleaner order-management flow.</p>
            <div class="login-example">
                <span>Example login</span>
                <strong>Username: admin</strong>
                <strong>Password: admin123</strong>
            </div>
        </section>
        <section class="login-card">
            <div class="login-card-header">
                <span class="eyebrow">Secure sign in</span>
                <h2>Welcome back</h2>
                <p>Use the sample credentials below to test the login flow.</p>
            </div>
            <form id="loginForm" class="login-form">
                <label>
                    <span>Username</span>
                    <input type="text" name="username" placeholder="Enter username" value="admin" required>
                </label>
                <label>
                    <span>Password</span>
                    <input type="password" name="password" placeholder="Enter password" value="admin123" required>
                </label>
                <button type="submit">Login to Workspace</button>
                <p id="loginMessage" class="login-message" aria-live="polite"></p>
            </form>
        </section>
    </main>
    <script>
        const loginForm = document.getElementById('loginForm');
        const loginMessage = document.getElementById('loginMessage');

        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            loginMessage.textContent = 'Signing you in...';

            const formData = new FormData(loginForm);
            const payload = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (!response.ok) {
                    loginMessage.textContent = result.message || 'Login failed.';
                    return;
                }

                window.location.href = result.redirect || '/workspace';
            } catch (error) {
                loginMessage.textContent = 'Unable to reach the server. Please try again.';
            }
        });
    </script>
</body>
</html>'''
