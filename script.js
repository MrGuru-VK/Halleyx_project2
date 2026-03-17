document.addEventListener('DOMContentLoaded', function() {
    const app = {
        orders: [],
        dashboard: {},
        currentWidget: null,
        editingOrderId: null,
        dateFilter: { start: null, end: null }
    };

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
    const logoutBtn = document.getElementById('logoutBtn');

    loadOrders();
    loadDashboard();

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
    logoutBtn.addEventListener('click', handleLogout);

    createOrderBtn.addEventListener('click', () => {
        editingOrderId = null;
        document.getElementById('modalTitle').textContent = 'Create Order';
        orderForm.reset();
        orderForm.orderDate.value = new Date().toISOString().split('T')[0];
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

    widgetPalette.addEventListener('dragstart', handleDragStart);
    configCanvas.addEventListener('dragover', handleDragOver);
    configCanvas.addEventListener('drop', handleDrop);

    orderForm.quantity.addEventListener('input', calculateTotal);
    orderForm.unitPrice.addEventListener('input', calculateTotal);

    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.type);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const type = event.dataTransfer.getData('text/plain');
        if (type) {
            addWidgetToConfig(type);
        }
    }

    function addWidgetToConfig(type) {
        const widget = {
            id: Date.now(),
            type,
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
        const defaults = { kpi: 3, bar: 6, line: 6, area: 6, scatter: 6, pie: 5, table: 8 };
        return defaults[type] || 4;
    }

    function getDefaultHeight(type) {
        const defaults = { kpi: 2, bar: 5, line: 5, area: 5, scatter: 5, pie: 4, table: 5 };
        return defaults[type] || 4;
    }

    function getDefaultConfig(type) {
        if (type === 'kpi') {
            return { metric: 'Total amount', aggregation: 'Sum', format: 'Currency', precision: 2 };
        }
        if (['bar', 'line', 'area', 'scatter'].includes(type)) {
            return { xAxis: 'Product', yAxis: 'Quantity', color: '#38bdf8', showLabels: true };
        }
        if (type === 'pie') {
            return { data: 'Product', showLegend: true };
        }
        if (type === 'table') {
            return {
                columns: ['Customer name', 'Product', 'Quantity', 'Total amount'],
                sortBy: 'Order date',
                pagination: 10,
                applyFilter: false
            };
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
                <button class="settings" data-id="${widget.id}" type="button">&#9881;</button>
                <button class="delete" data-id="${widget.id}" type="button">&#128465;</button>
            `;
            div.querySelector('.settings').addEventListener('click', () => openWidgetConfig(widget));
            div.querySelector('.delete').addEventListener('click', () => deleteWidget(widget.id));
            configCanvas.appendChild(div);
        });
    }

    function openWidgetConfig(widget) {
        app.currentWidget = widget;
        widgetForm.innerHTML = generateWidgetForm(widget);
        widgetModal.classList.remove('hidden');
        widgetForm.onsubmit = saveWidgetConfig;
    }

    function generateWidgetForm(widget) {
        const { type, config } = widget;
        let html = `<input type="text" name="title" value="${widget.title || 'Untitled'}" required><br>`;

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
                    <option value="Order Date" ${config.xAxis === 'Order Date' ? 'selected' : ''}>Order Date</option>
                    <option value="Country" ${config.xAxis === 'Country' ? 'selected' : ''}>Country</option>
                    <option value="Status" ${config.xAxis === 'Status' ? 'selected' : ''}>Status</option>
                </select>
                <select name="yAxis">
                    <option value="Quantity" ${config.yAxis === 'Quantity' ? 'selected' : ''}>Quantity</option>
                    <option value="Total amount" ${config.yAxis === 'Total amount' ? 'selected' : ''}>Total amount</option>
                    <option value="Order count" ${config.yAxis === 'Order count' ? 'selected' : ''}>Order count</option>
                </select>
                <input type="color" name="color" value="${config.color || '#38bdf8'}">
                <label><input type="checkbox" name="showLabels" ${config.showLabels ? 'checked' : ''}> Show Labels</label>
            `;
        } else if (type === 'pie') {
            html += `
                <select name="data">
                    <option value="Product" ${config.data === 'Product' ? 'selected' : ''}>Product</option>
                    <option value="Status" ${config.data === 'Status' ? 'selected' : ''}>Status</option>
                </select>
                <label><input type="checkbox" name="showLegend" ${config.showLegend ? 'checked' : ''}> Show Legend</label>
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
                <label><input type="checkbox" name="applyFilter" ${config.applyFilter ? 'checked' : ''}> Apply Filter</label>
            `;
        }

        html += `
            <input type="number" name="width" value="${widget.width}" min="1">
            <input type="number" name="height" value="${widget.height}" min="1">
            <button type="submit">Save</button>
        `;

        return html;
    }

    function saveWidgetConfig(event) {
        event.preventDefault();
        const formData = new FormData(widgetForm);
        app.currentWidget.title = formData.get('title');
        app.currentWidget.width = parseInt(formData.get('width'), 10);
        app.currentWidget.height = parseInt(formData.get('height'), 10);

        if (app.currentWidget.type === 'kpi') {
            app.currentWidget.config = {
                metric: formData.get('metric'),
                aggregation: formData.get('aggregation'),
                format: formData.get('format'),
                precision: parseInt(formData.get('precision'), 10)
            };
        } else if (['bar', 'line', 'area', 'scatter'].includes(app.currentWidget.type)) {
            app.currentWidget.config = {
                xAxis: formData.get('xAxis'),
                yAxis: formData.get('yAxis'),
                color: formData.get('color'),
                showLabels: formData.get('showLabels') === 'on'
            };
        } else if (app.currentWidget.type === 'pie') {
            app.currentWidget.config = {
                data: formData.get('data'),
                showLegend: formData.get('showLegend') === 'on'
            };
        } else if (app.currentWidget.type === 'table') {
            app.currentWidget.config = {
                columns: formData.getAll('columns'),
                sortBy: formData.get('sortBy'),
                pagination: parseInt(formData.get('pagination'), 10),
                applyFilter: formData.get('applyFilter') === 'on'
            };
        }

        widgetModal.classList.add('hidden');
        renderConfigCanvas();
    }

    function deleteWidget(id) {
        app.dashboard.widgets = (app.dashboard.widgets || []).filter(widget => widget.id !== id);
        renderConfigCanvas();
    }

    function saveDashboardConfig() {
        apiFetch('/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(app.dashboard)
        }).then(() => alert('Saved'));
    }

    function loadOrders() {
        apiFetch('/orders')
            .then(res => res.json())
            .then(data => {
                app.orders = data;
                renderOrders();
                renderDashboard();
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
                <td><button class="edit" data-id="${order.id}" type="button">Edit</button><button class="delete" data-id="${order.id}" type="button">Delete</button></td>
            `;
            row.querySelector('.edit').addEventListener('click', () => editOrder(order.id));
            row.querySelector('.delete').addEventListener('click', () => deleteOrder(order.id));
            ordersTable.appendChild(row);
        });
    }

    function handleOrderSubmit(event) {
        event.preventDefault();
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
            quantity: parseInt(formData.get('quantity'), 10),
            unitPrice: parseFloat(formData.get('unitPrice')),
            totalAmount: parseFloat(formData.get('totalAmount')),
            status: formData.get('status'),
            createdBy: formData.get('createdBy'),
            orderDate: formData.get('orderDate') || new Date().toISOString().split('T')[0]
        };

        if (editingOrderId) {
            apiFetch(`/orders/${editingOrderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            }).then(() => {
                loadOrders();
                orderModal.classList.add('hidden');
            });
            return;
        }

        apiFetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        }).then(() => {
            loadOrders();
            orderModal.classList.add('hidden');
        });
    }

    function editOrder(id) {
        editingOrderId = id;
        const order = app.orders.find(item => item.id === id);
        document.getElementById('modalTitle').textContent = 'Edit Order';
        orderForm.firstName.value = order.firstName;
        orderForm.lastName.value = order.lastName;
        orderForm.email.value = order.email;
        orderForm.phone.value = order.phone;
        orderForm.streetAddress.value = order.streetAddress;
        orderForm.city.value = order.city;
        orderForm.state.value = order.state;
        orderForm.postalCode.value = order.postalCode;
        orderForm.country.value = order.country;
        orderForm.product.value = order.product;
        orderForm.quantity.value = order.quantity;
        orderForm.unitPrice.value = order.unitPrice;
        orderForm.totalAmount.value = order.totalAmount;
        orderForm.status.value = order.status;
        orderForm.createdBy.value = order.createdBy;
        orderForm.orderDate.value = order.orderDate;
        orderModal.classList.remove('hidden');
    }

    function deleteOrder(id) {
        if (confirm('Delete?')) {
            apiFetch(`/orders/${id}`, { method: 'DELETE' }).then(() => loadOrders());
        }
    }

    function loadDashboard() {
        apiFetch('/dashboard')
            .then(res => res.json())
            .then(data => {
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
            data = data.filter(order => {
                const date = new Date(order.orderDate);
                return (!app.dateFilter.start || date >= app.dateFilter.start) &&
                    (!app.dateFilter.end || date <= app.dateFilter.end);
            });
        }

        const values = data.map(order => parseFloat(order[config.metric.toLowerCase().replace(' ', '')] || 0));
        if (config.aggregation === 'Sum') {
            return values.reduce((a, b) => a + b, 0);
        }
        if (config.aggregation === 'Average') {
            return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        }
        return values.length;
    }

    function formatValue(value, config) {
        if (config.format === 'Currency') {
            return '$' + value.toFixed(config.precision);
        }
        return value.toFixed(config.precision);
    }

    function drawChart(canvas, type, config) {
        const ctx = canvas.getContext('2d');
        canvas.width = 520;
        canvas.height = 320;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const chartData = type === 'scatter'
            ? getScatterChartData(config)
            : getCartesianChartData(config);

        if (!chartData.points.length) {
            drawNoDataState(ctx, canvas);
            return;
        }

        const padding = { top: 24, right: 24, bottom: 58, left: 54 };
        const plotWidth = canvas.width - padding.left - padding.right;
        const plotHeight = canvas.height - padding.top - padding.bottom;
        const maxY = Math.max(...chartData.points.map(point => point.y), 1);
        const stepX = chartData.points.length > 1 ? plotWidth / (chartData.points.length - 1) : plotWidth / 2;

        drawChartFrame(ctx, canvas, padding, maxY);

        const points = chartData.points.map((point, index) => ({
            x: chartData.points.length === 1 ? padding.left + (plotWidth / 2) : padding.left + (index * stepX),
            y: padding.top + plotHeight - ((point.y / maxY) * plotHeight),
            label: point.label,
            value: point.y,
            rawX: point.rawX
        }));

        if (type === 'bar') {
            drawBarSeries(ctx, points, padding, plotWidth, canvas.height, config);
        } else if (type === 'line') {
            drawLineSeries(ctx, points, config, false);
        } else if (type === 'area') {
            drawLineSeries(ctx, points, config, true, canvas.height - padding.bottom);
        } else if (type === 'scatter') {
            drawScatterSeries(ctx, points, config);
        }

        drawXAxisLabels(ctx, points, canvas.height - padding.bottom + 18, config.showLabels);
    }

    function drawPie(canvas, config) {
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        const groupedData = getPieChartData(config);
        const entries = Object.entries(groupedData);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!entries.length) {
            ctx.fillStyle = '#9bb0d3';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }

        const total = entries.reduce((sum, [, value]) => sum + value, 0);
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        const colors = ['#38bdf8', '#22c55e', '#f97316', '#ef4444', '#eab308', '#a855f7', '#14b8a6', '#f43f5e'];

        let startAngle = -Math.PI / 2;
        entries.forEach(([label, value], index) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            startAngle = endAngle;
        });

        if (config.showLegend) {
            drawPieLegend(ctx, entries, colors, total);
        }
    }

    function getPieChartData(config) {
        let data = app.orders;

        if (app.dateFilter.start || app.dateFilter.end) {
            data = data.filter(order => {
                const date = new Date(order.orderDate);
                return (!app.dateFilter.start || date >= app.dateFilter.start) &&
                    (!app.dateFilter.end || date <= app.dateFilter.end);
            });
        }

        return data.reduce((acc, order) => {
            const key = config.data === 'Status' ? order.status : order.product;
            if (!key) {
                return acc;
            }
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }

    function drawPieLegend(ctx, entries, colors, total) {
        const legendX = 275;
        const legendY = 40;
        const lineHeight = 24;

        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        entries.forEach(([label, value], index) => {
            const y = legendY + (index * lineHeight);
            const percentage = ((value / total) * 100).toFixed(1);

            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(legendX, y - 8, 12, 12);

            ctx.fillStyle = '#e9f1ff';
            ctx.fillText(`${label} (${value}, ${percentage}%)`, legendX + 20, y);
        });
    }

    function renderWidgetTable(table, config) {
        table.innerHTML = '<tr><td>Data</td></tr>';
    }

    function getFilteredOrders() {
        let data = app.orders;
        if (app.dateFilter.start || app.dateFilter.end) {
            data = data.filter(order => {
                const date = new Date(order.orderDate);
                return (!app.dateFilter.start || date >= app.dateFilter.start) &&
                    (!app.dateFilter.end || date <= app.dateFilter.end);
            });
        }
        return data;
    }

    function getCartesianChartData(config) {
        const grouped = new Map();

        getFilteredOrders().forEach(order => {
            const xValue = getFieldValue(order, config.xAxis);
            const label = String(xValue || 'Unknown');
            const current = grouped.get(label) || 0;
            grouped.set(label, current + getNumericMetric(order, config.yAxis));
        });

        return {
            points: Array.from(grouped.entries()).map(([label, value]) => ({
                label,
                y: value
            }))
        };
    }

    function getScatterChartData(config) {
        const orders = getFilteredOrders();
        const xField = config.xAxis;
        const xIsNumeric = ['Quantity', 'Total amount'].includes(xField);
        const categoryIndex = new Map();
        let nextIndex = 1;

        const points = orders.map(order => {
            const rawX = getFieldValue(order, xField);
            let xValue;

            if (xIsNumeric) {
                xValue = Number(rawX) || 0;
            } else {
                const label = String(rawX || 'Unknown');
                if (!categoryIndex.has(label)) {
                    categoryIndex.set(label, nextIndex++);
                }
                xValue = categoryIndex.get(label);
            }

            return {
                label: String(rawX || 'Unknown'),
                rawX: xValue,
                y: getNumericMetric(order, config.yAxis)
            };
        });

        points.sort((a, b) => a.rawX - b.rawX);
        return { points };
    }

    function getFieldValue(order, field) {
        switch (field) {
            case 'Product':
                return order.product;
            case 'Quantity':
                return order.quantity;
            case 'Order Date':
                return order.orderDate;
            case 'Country':
                return order.country;
            case 'Status':
                return order.status;
            case 'Total amount':
                return order.totalAmount;
            default:
                return order.product;
        }
    }

    function getNumericMetric(order, metric) {
        switch (metric) {
            case 'Quantity':
                return Number(order.quantity) || 0;
            case 'Total amount':
                return Number(order.totalAmount) || 0;
            case 'Order count':
                return 1;
            default:
                return Number(order.quantity) || 0;
        }
    }

    function drawNoDataState(ctx, canvas) {
        ctx.fillStyle = '#9bb0d3';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available for this chart', canvas.width / 2, canvas.height / 2);
    }

    function drawChartFrame(ctx, canvas, padding, maxY) {
        const bottom = canvas.height - padding.bottom;
        const left = padding.left;
        const right = canvas.width - padding.right;
        const top = padding.top;

        ctx.strokeStyle = 'rgba(155, 176, 211, 0.25)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i += 1) {
            const y = top + ((bottom - top) / 4) * i;
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();

            const value = Math.round(maxY - ((maxY / 4) * i));
            ctx.fillStyle = '#9bb0d3';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(String(value), left - 8, y + 4);
        }

        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.strokeStyle = 'rgba(233, 241, 255, 0.4)';
        ctx.stroke();
    }

    function drawBarSeries(ctx, points, padding, plotWidth, canvasHeight, config) {
        const barWidth = Math.min(54, (plotWidth / points.length) * 0.62);
        ctx.fillStyle = config.color;

        points.forEach(point => {
            const barX = point.x - (barWidth / 2);
            const barHeight = canvasHeight - padding.bottom - point.y;
            ctx.fillRect(barX, point.y, barWidth, barHeight);

            if (config.showLabels) {
                ctx.fillStyle = '#e9f1ff';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(formatCompactNumber(point.value), point.x, point.y - 8);
                ctx.fillStyle = config.color;
            }
        });
    }

    function drawLineSeries(ctx, points, config, fillArea, baselineY) {
        if (fillArea) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, baselineY);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.lineTo(points[points.length - 1].x, baselineY);
            ctx.closePath();
            ctx.fillStyle = hexToRgba(config.color, 0.2);
            ctx.fill();
        }

        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e9f1ff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = config.color;
            ctx.fill();

            if (config.showLabels) {
                ctx.fillStyle = '#e9f1ff';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(formatCompactNumber(point.value), point.x, point.y - 10);
            }
        });
    }

    function drawScatterSeries(ctx, points, config) {
        points.forEach(point => {
            ctx.beginPath();
            ctx.fillStyle = hexToRgba(config.color, 0.78);
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = '#e9f1ff';
            ctx.lineWidth = 1.5;
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.stroke();

            if (config.showLabels) {
                ctx.fillStyle = '#e9f1ff';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(formatCompactNumber(point.value), point.x, point.y - 10);
            }
        });
    }

    function drawXAxisLabels(ctx, points, y, showLabels) {
        ctx.fillStyle = '#9bb0d3';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        points.forEach(point => {
            const label = showLabels ? point.label : truncateLabel(point.label, 10);
            ctx.fillText(truncateLabel(label, 12), point.x, y);
        });
    }

    function truncateLabel(label, maxLength) {
        return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
    }

    function formatCompactNumber(value) {
        if (Math.abs(value) >= 1000) {
            return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
        }
        return Number(value).toFixed(value % 1 === 0 ? 0 : 1);
    }

    function hexToRgba(hex, alpha) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function calculateTotal() {
        const qty = parseInt(orderForm.quantity.value, 10) || 0;
        const price = parseFloat(orderForm.unitPrice.value) || 0;
        orderForm.totalAmount.value = (qty * price).toFixed(2);
    }

    function apiFetch(url, options = {}) {
        return fetch(url, options).then(response => {
            if (response.status === 401) {
                window.location.href = '/';
                throw new Error('Unauthorized');
            }
            return response;
        });
    }

    function handleLogout() {
        apiFetch('/logout', { method: 'POST' })
            .then(res => res.json())
            .then(result => {
                window.location.href = result.redirect || '/';
            });
    }
});
