# Halleyx Custom Dashboard Builder (Prototype)

## Overview

The "Halleyx Custom Dashboard Builder" is a prototype web application that allows users to create and manage personalized dashboards using configurable widgets.
It also includes a "customer order management system", user authentication, and a "Google Authenticator-based password recovery mechanism".

This project demonstrates the core idea of a **data-driven workspace** where users can monitor analytics and manage operational data from a single interface.

This prototype was developed in **approximately 6 hours** to demonstrate the concept and core functionality.

# Key Features

## 1. User Authentication System

The system includes a basic login and registration mechanism.

Features:

* User login
* New user registration
* Session-based authentication
* Logout functionality

Each user receives their own isolated workspace environment.


## 2. Google Authenticator Password Recovery

The project implements **Time-Based One-Time Password (TOTP)** verification compatible with Google Authenticator.

Capabilities:

* Generate authenticator secret
* Link account to Google Authenticator
* Verify 6-digit OTP
* Reset password securely

This provides an additional authentication layer for account recovery.

## 3. Custom Dashboard Builder

Users can build their own analytics dashboards using draggable widgets.

Available widgets include:

* KPI Cards
* Bar Charts
* Line Charts
* Area Charts
* Scatter Plots
* Pie Charts
* Data Tables

Users can:

* Drag widgets into the dashboard
* Configure chart properties
* Save the dashboard configuration
* Reload dashboards dynamically

Dashboard configurations are stored in JSON format.


## 4. Customer Order Management

The system includes a simple CRM-style order management interface.

Users can:

* Create new orders
* View existing orders
* Edit orders
* Delete orders

Order fields include:

* Customer information
* Product
* Quantity
* Unit price
* Total amount
* Order status
* Order date
* Address details

Orders are displayed in a structured table within the workspace.


# System Architecture

## Frontend

HTML, CSS, and JavaScript are used to create the user interface.

Key components include:

* Login interface
* Dashboard workspace
* Widget configuration panel
* Order management table


## Backend

The backend is built using **Python Flask**.

Responsibilities include:

* API routing
* User authentication
* Dashboard configuration storage
* Order CRUD operations
* Google Authenticator verification

## Data Storage

For simplicity, the prototype uses **JSON files** instead of a database.

Structure:

'''
user_data/
    username/
        orders.json
        dashboard.json
        environment.json
'''

This approach enables quick prototyping without requiring database setup.


# API Endpoints

## Authentication

 Method  Endpoint   Description     
 ------  ---------  --------------- 
 POST    /login     User login      
 POST    /register  Create new user 
 POST    /logout    Logout user     

---

## Authenticator

 Method  Endpoint                       Description                   
 ------  -----------------------------  ----------------------------- 
 POST    /authenticator/setup           Generate authenticator secret 
 POST    /authenticator/verify          Verify OTP code               
 POST    /authenticator/reset-password  Reset password                

---

## Orders

 Method  Endpoint      Description         
 ------  ------------  ------------------- 
 GET     /orders       Retrieve all orders 
 POST    /orders       Create order        
 PUT     /orders/{id}  Update order        
 DELETE  /orders/{id}  Delete order        

---

## Dashboard

 Method  Endpoint    Description                  
 ------  ----------  ---------------------------- 
 GET     /dashboard  Load dashboard configuration 
 POST    /dashboard  Save dashboard configuration 

---

# Running the Project

## Requirements

Python 3.x
Flask
Flask-CORS

Install dependencies:

'''bash
pip install flask flask-cors
'''

Run the application:

'''bash
python app.py
'''

Open in browser:

'''
http://localhost:8080
'''

# Default Login

Example credentials for testing:

'''
Username: admin
Password: admin123
passwords can be changed in the forget password page by using an authenticator 
'''


This project is a "prototype" and therefore includes several simplified implementations:
* No database (JSON storage used)
* No production security hardening
* No rate limiting or brute force protection
* Single-server architecture
These aspects would be improved in a production version.

Possible enhancements include:

* Password hashing using bcrypt
* Database integration (PostgreSQL / MongoDB)
* Real-time analytics updates
* Role-based access control
* Dashboard sharing
* Cloud deployment
* Advanced visualization tools

* Python
* Flask
* HTML5
* CSS3
* JavaScript
* JSON storage
* TOTP Authentication

Guruprakash V K
Artificial Intelligence and Data Science Engineering Student
Embedded Systems & IoT Developer
