document.addEventListener('DOMContentLoaded', function() {
    const app = {
        orders: [],
        dashboard: {},
        currentWidget: null,
        editingOrderId: null,
        dateFilter: { start: null, end: null }
    };

    // Elements
    const configureBtn = document.getElementById('configureBtn');
    const dashboardView = document.getElementById('dashboardView');
    const configView = document.getElementById('configView');
    const saveConfig = document.getElementById('saveConfig');
    const backToDashboard = document.getElementById('backToDashboard');
    const dashboardCanvas = document.getElementById('dashboardCanvas');
    const configCanvas = document.getElementById('configCanvas');
    const widgetPalette = document.getElementById('widgetPalette');
    const ordersTable = document.getElementById('ordersTable').querySelector('tbody');
    const createOrderBtn = document.getElementById('createOrderBtn');
    const orderModal = document.getElementById('orderModal');
    const orderForm = document.getElementById('orderForm');
    const widgetModal = document.getElementById('widgetModal');
    const widgetForm = document.getElementById('widgetForm');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const applyFilter = document.getElementById('applyFilter');

    // Load data
    loadOrders();
    loadDashboard();

    // Event listeners
    configureBtn.addEventListener('click', () => {
        dashboardView.classList.add('hidden');
        configView.classList.remove('hidden');
        renderConfigCanvas();
    });

    backToDashboard.addEventListener('click', () => {
        configView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        renderDashboard();
    });

    saveConfig.addEventListener('click', saveDashboardConfig);

    createOrderBtn.addEventListener('click', () => {
        editingOrderId = null;
        document.getElementById('modalTitle').textContent = 'Create Order';
        orderForm.reset();
        orderModal.classList.remove('hidden');
    });

    orderForm.addEventListener('submit', handleOrderSubmit);

    orderModal.querySelector('.close').addEventListener('click', () => orderModal.classList.add('hidden'));
    widgetModal.querySelector('.close').addEventListener('click', () => widgetModal.classList.add('hidden'));

    applyFilter.addEventListener('click', () => {
        app.dateFilter.start = startDate.value ? new Date(startDate.value) : null;
        app.dateFilter.end = endDate.value ? new Date(endDate.value) : null;
        renderDashboard();
    });

    // Drag and drop
    widgetPalette.addEventListener('dragstart', handleDragStart);
    configCanvas.addEventListener('dragover', handleDragOver);
    configCanvas.addEventListener('drop', handleDrop);

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (type) {
            addWidgetToConfig(type);
        }
    }

    function addWidgetToConfig(type) {
        const widget = {
            id: Date.now(),
            type: type,
            title: 'Untitled',
            width: getDefaultWidth(type),
            height: getDefaultHeight(type),
            config: getDefaultConfig(type)
        };
        app.dashboard.widgets = app.dashboard.widgets || [];
        app.dashboard.widgets.push(widget);
        renderConfigCanvas();
    }

    function getDefaultWidth(type) {
        const defaults = { kpi: 2, bar: 5, line: 5, area: 5, scatter: 5, pie: 4, table: 4 };
        return defaults[type] || 4;
    }

    function getDefaultHeight(type) {
        const defaults = { kpi: 2, bar: 5, line: 5, area: 5, scatter: 5, pie: 4, table: 4 };
        return defaults[type] || 4;
    }

    function getDefaultConfig(type) {
        if (type === 'kpi') {
            return { metric: 'Total amount', aggregation: 'Sum', format: 'Currency', precision: 2 };
        } else if (['bar', 'line', 'area', 'scatter'].includes(type)) {
            return { xAxis: 'Product', yAxis: 'Quantity', color: '#007bff', showLabels: false };
        } else if (type === 'pie') {
            return { data: 'Product', showLegend: true };
        } else if (type === 'table') {
            return { columns: ['Customer name', 'Product', 'Quantity', 'Total amount'], sortBy: 'Order date', pagination: 10, applyFilter: false };
        }
        return {};
    }

    function renderConfigCanvas() {
        configCanvas.innerHTML = '';
        (app.dashboard.widgets || []).forEach(widget => {
            const div = document.createElement('div');
            div.className = 'widget';
            div.style.gridColumn = `span ${widget.width}`;
            div.style.gridRow = `span ${widget.height}`;
            div.innerHTML = `
                <h3>${widget.title}</h3>
                <p>${widget.type}</p>
                <button class="settings" data-id="${widget.id}">⚙</button>
                <button class="delete" data-id="${widget.id}">🗑</button>
            `;
            div.querySelector('.settings').addEventListener('click', () => openWidgetConfig(widget));
            div.querySelector('.delete').addEventListener('click', () => deleteWidget(widget.id));
            configCanvas.appendChild(div);
        });
    }

    function openWidgetConfig(widget) {
        app.currentWidget = widget;
        widgetForm.innerHTML = generateWidgetForm(widget.type, widget.config);
        widgetModal.classList.remove('hidden');
        widgetForm.addEventListener('submit', saveWidgetConfig);
    }

    function generateWidgetForm(type, config) {
        let html = `<input type="text" name="title" value="${config.title || 'Untitled'}" required><br>`;
        if (type === 'kpi') {
            html += `
                <select name="metric">
                    <option value="Customer ID" ${config.metric === 'Customer ID' ? 'selected' : ''}>Customer ID</option>
                    <option value="Total amount" ${config.metric === 'Total amount' ? 'selected' : ''}>Total amount</option>
                    <option value="Quantity" ${config.metric === 'Quantity' ? 'selected' : ''}>Quantity</option>
                </select>
                <select name="aggregation">
                    <option value="Sum" ${config.aggregation === 'Sum' ? 'selected' : ''}>Sum</option>
                    <option value="Average" ${config.aggregation === 'Average' ? 'selected' : ''}>Average</option>
                    <option value="Count" ${config.aggregation === 'Count' ? 'selected' : ''}>Count</option>
                </select>
                <select name="format">
                    <option value="Number" ${config.format === 'Number' ? 'selected' : ''}>Number</option>
                    <option value="Currency" ${config.format === 'Currency' ? 'selected' : ''}>Currency</option>
                </select>
                <input type="number" name="precision" value="${config.precision || 0}" min="0">
            `;
        } else if (['bar', 'line', 'area', 'scatter'].includes(type)) {
            html += `
                <select name="xAxis">
                    <option value="Product" ${config.xAxis === 'Product' ? 'selected' : ''}>Product</option>
                    <option value="Quantity" ${config.xAxis === 'Quantity' ? 'selected' : ''}>Quantity</option>
                </select>
                <select name="yAxis">
                    <option value="Quantity" ${config.yAxis === 'Quantity' ? 'selected' : ''}>Quantity</option>
                    <option value="Total amount" ${config.yAxis === 'Total amount' ? 'selected' : ''}>Total amount</option>
                </select>
                <input type="color" name="color" value="${config.color || '#007bff'}">
                <input type="checkbox" name="showLabels" ${config.showLabels ? 'checked' : ''}> Show Labels
            `;
        } else if (type === 'pie') {
            html += `
                <select name="data">
                    <option value="Product" ${config.data === 'Product' ? 'selected' : ''}>Product</option>
                    <option value="Status" ${config.data === 'Status' ? 'selected' : ''}>Status</option>
                </select>
                <input type="checkbox" name="showLegend" ${config.showLegend ? 'checked' : ''}> Show Legend
            `;
        } else if (type === 'table') {
            html += `
                <select name="columns" multiple>
                    <option value="Customer name" ${config.columns.includes('Customer name') ? 'selected' : ''}>Customer name</option>
                    <option value="Product" ${config.columns.includes('Product') ? 'selected' : ''}>Product</option>
                    <option value="Quantity" ${config.columns.includes('Quantity') ? 'selected' : ''}>Quantity</option>
                    <option value="Total amount" ${config.columns.includes('Total amount') ? 'selected' : ''}>Total amount</option>
                </select>
                <select name="sortBy">
                    <option value="Order date" ${config.sortBy === 'Order date' ? 'selected' : ''}>Order date</option>
                    <option value="Ascending" ${config.sortBy === 'Ascending' ? 'selected' : ''}>Ascending</option>
                </select>
                <input type="number" name="pagination" value="${config.pagination || 10}">
                <input type="checkbox" name="applyFilter" ${config.applyFilter ? 'checked' : ''}> Apply Filter
            `;
        }
        html += `<input type="number" name="width" value="${widget.width}" min="1">
                 <input type="number" name="height" value="${widget.height}" min="1">
                 <button type="submit">Save</button>`;
        return html;
    }

    function saveWidgetConfig(e) {
        e.preventDefault();
        const formData = new FormData(widgetForm);
        app.currentWidget.title = formData.get('title');
        app.currentWidget.width = parseInt(formData.get('width'));
        app.currentWidget.height = parseInt(formData.get('height'));
        // Update config
        if (app.currentWidget.type === 'kpi') {
            app.currentWidget.config = {
                metric: formData.get('metric'),
                aggregation: formData.get('aggregation'),
                format: formData.get('format'),
                precision: parseInt(formData.get('precision'))
            };
        } // Similarly for others
        widgetModal.classList.add('hidden');
        renderConfigCanvas();
    }

    function deleteWidget(id) {
        app.dashboard.widgets = app.dashboard.widgets.filter(w => w.id !== id);
        renderConfigCanvas();
    }

    function saveDashboardConfig() {
        fetch('/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(app.dashboard)
        }).then(() => alert('Saved'));
    }

    function loadOrders() {
        fetch('/orders').then(res => res.json()).then(data => {
            app.orders = data;
            renderOrders();
        });
    }

    function renderOrders() {
        ordersTable.innerHTML = '';
        app.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.firstName}</td>
                <td>${order.lastName}</td>
                <td>${order.email}</td>
                <td>${order.phone}</td>
                <td>${order.streetAddress}, ${order.city}, ${order.state} ${order.postalCode}</td>
                <td>${order.city}</td>
                <td>${order.state}</td>
                <td>${order.postalCode}</td>
                <td>${order.country}</td>
                <td>${order.id}</td>
                <td>${order.orderDate}</td>
                <td>${order.product}</td>
                <td>${order.quantity}</td>
                <td>${order.unitPrice}</td>
                <td>${order.totalAmount}</td>
                <td>${order.status}</td>
                <td>${order.createdBy}</td>
                <td><button class="edit" data-id="${order.id}">Edit</button><button class="delete" data-id="${order.id}">Delete</button></td>
            `;
            row.querySelector('.edit').addEventListener('click', () => editOrder(order.id));
            row.querySelector('.delete').addEventListener('click', () => deleteOrder(order.id));
            ordersTable.appendChild(row);
        });
    }

    function handleOrderSubmit(e) {
        e.preventDefault();
        const formData = new FormData(orderForm);
        const order = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            streetAddress: formData.get('streetAddress'),
            city: formData.get('city'),
            state: formData.get('state'),
            postalCode: formData.get('postalCode'),
            country: formData.get('country'),
            product: formData.get('product'),
            quantity: parseInt(formData.get('quantity')),
            unitPrice: parseFloat(formData.get('unitPrice')),
            totalAmount: parseFloat(formData.get('totalAmount')),
            status: formData.get('status'),
            createdBy: formData.get('createdBy'),
            orderDate: new Date().toISOString().split('T')[0] // Add current date
        };
        if (editingOrderId) {
            fetch(`/orders/${editingOrderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            }).then(() => {
                loadOrders();
                orderModal.classList.add('hidden');
            });
        } else {
            fetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            }).then(() => {
                loadOrders();
                orderModal.classList.add('hidden');
            });
        }
    }

    function editOrder(id) {
        editingOrderId = id;
        const order = app.orders.find(o => o.id === id);
        document.getElementById('modalTitle').textContent = 'Edit Order';
        orderForm.firstName.value = order.firstName;
        // Populate other fields
        orderModal.classList.remove('hidden');
    }

    function deleteOrder(id) {
        if (confirm('Delete?')) {
            fetch(`/orders/${id}`, { method: 'DELETE' }).then(() => loadOrders());
        }
    }

    function loadDashboard() {
        fetch('/dashboard').then(res => res.json()).then(data => {
            app.dashboard = data;
            renderDashboard();
        });
    }

    function renderDashboard() {
        dashboardCanvas.innerHTML = '';
        (app.dashboard.widgets || []).forEach(widget => {
            const div = document.createElement('div');
            div.className = 'widget';
            div.style.gridColumn = `span ${widget.width}`;
            div.style.gridRow = `span ${widget.height}`;
            div.innerHTML = `<h3>${widget.title}</h3>`;
            // Render content based on type
            if (widget.type === 'kpi') {
                const value = calculateKPI(widget.config);
                div.innerHTML += `<div class="kpi-value">${formatValue(value, widget.config)}</div>`;
            } else if (['bar', 'line', 'area', 'scatter'].includes(widget.type)) {
                const canvas = document.createElement('canvas');
                div.appendChild(canvas);
                drawChart(canvas, widget.type, widget.config);
            } else if (widget.type === 'pie') {
                const canvas = document.createElement('canvas');
                div.appendChild(canvas);
                drawPie(canvas, widget.config);
            } else if (widget.type === 'table') {
                const table = document.createElement('table');
                div.appendChild(table);
                renderWidgetTable(table, widget.config);
            }
            dashboardCanvas.appendChild(div);
        });
    }

    function calculateKPI(config) {
        let data = app.orders;
        if (app.dateFilter.start || app.dateFilter.end) {
            data = data.filter(o => {
                const date = new Date(o.orderDate);
                return (!app.dateFilter.start || date >= app.dateFilter.start) && (!app.dateFilter.end || date <= app.dateFilter.end);
            });
        }
        const values = data.map(o => parseFloat(o[config.metric.toLowerCase().replace(' ', '')] || 0));
        if (config.aggregation === 'Sum') return values.reduce((a,b) => a+b, 0);
        if (config.aggregation === 'Average') return values.reduce((a,b) => a+b, 0) / values.length;
        return values.length;
    }

    function formatValue(value, config) {
        if (config.format === 'Currency') return '$' + value.toFixed(config.precision);
        return value.toFixed(config.precision);
    }

    function drawChart(canvas, type, config) {
        // Simple bar chart implementation
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        // Dummy data for now
        const data = [10, 20, 30, 40];
        const labels = ['A', 'B', 'C', 'D'];
        ctx.fillStyle = config.color;
        data.forEach((val, i) => {
            ctx.fillRect(i * 100, 300 - val * 5, 80, val * 5);
        });
    }

    function drawPie(canvas, config) {
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        // Dummy pie
        ctx.beginPath();
        ctx.arc(200, 150, 100, 0, Math.PI * 2);
        ctx.fillStyle = '#007bff';
        ctx.fill();
    }

    function renderWidgetTable(table, config) {
        // Simple table
        table.innerHTML = '<tr><td>Data</td></tr>';
    }

    // Calculate total amount
    orderForm.quantity.addEventListener('input', calculateTotal);
    orderForm.unitPrice.addEventListener('input', calculateTotal);

    function calculateTotal() {
        const qty = parseInt(orderForm.quantity.value) || 0;
        const price = parseFloat(orderForm.unitPrice.value) || 0;
        orderForm.totalAmount.value = (qty * price).toFixed(2);
    }
});