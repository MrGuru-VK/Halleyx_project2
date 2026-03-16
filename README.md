# Halleyx Custom Dashboard Builder

A full-stack web application for creating personalized dashboards with widgets like KPI cards, charts, and tables, integrated with a customer order management system.

## Features

- **Dashboard Builder**: Drag-and-drop widgets onto a responsive grid canvas.
- **Widgets**: KPI Cards, Bar Charts, Line Charts, Area Charts, Scatter Plots, Pie Charts, Tables.
- **Customer Order Management**: Create, edit, delete orders with full CRUD operations.
- **Responsive Design**: Adapts to desktop (12-column), tablet (8-column), and mobile (4-column) grids.
- **Real-time Data**: Widgets pull data from the customer orders.
- **Date Filtering**: Filter dashboard data by date range.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python Flask
- **Data Storage**: JSON files
- **Styling**: CSS with animations

## Setup and Run

1. Ensure Python 3.13 is installed.
2. Install dependencies: Flask and Flask-CORS are already installed.
3. Run the backend server:
   ```
   python app.py
   ```
   The server will start on http://localhost:5000

4. Open `index.html` in a web browser to access the application.

## Usage

- **Dashboard**: View configured widgets. Click "Configure Dashboard" to edit.
- **Configuration**: Drag widgets from the palette to the canvas. Configure each widget via settings.
- **Orders**: Add new orders using the "Create Order" button. Edit or delete existing orders.

## File Structure

- `index.html`: Main application page
- `styles.css`: Stylesheet with responsive design and animations
- `script.js`: Frontend JavaScript logic
- `app.py`: Flask backend API
- `orders.json`: Stores customer order data
- `dashboard.json`: Stores dashboard configuration