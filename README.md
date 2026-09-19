# Eventish 🎉

### Smart Event Management & Vendor Recommendation Platform

Eventish is a full-stack event management platform that helps users plan events and discover suitable vendors and services based on their event requirements.

The project includes a **React web application, Node.js/Express backend, MongoDB database, and React Native mobile application**.

## ✨ Features

### 👤 Customer

* User registration and authentication
* Create and manage events
* Specify required services and event details
* Browse vendors and services
* Receive vendor recommendations
* View vendor details
* Send booking requests
* Make advance payments through eSewa
* Save vendors to a personal wishlist
* Review vendors
* Communicate with vendors
* Receive notifications

### 🏪 Vendor

* Vendor registration and profile management
* Add and manage services
* Manage booking requests
* Communicate with customers
* Manage vendor information
* Receive notifications

### 🛠️ Admin

* Manage users and vendors
* Review vendor information
* Support basic platform administration

## 🤖 Vendor Recommendation System

Eventish includes a recommendation system based on an **Enhanced Weighted Jaccard similarity approach**.

The system compares information from an event with vendor/service information and uses factors such as:

* Required services
* Location
* Relevant keywords
* Event information

Different weights are applied to important matching features to improve the relevance of recommended vendors.

The recommendation API provides the top recommended verified vendors based on the calculated similarity.

## 💳 eSewa Payment Integration

Eventish integrates the **eSewa payment gateway** for advance booking payments.

The payment workflow includes:

1. Customer submits a booking request.
2. Vendor accepts and schedules the service.
3. Customer selects a payment method.
4. For eSewa, the backend prepares the payment payload.
5. The payment form is submitted to eSewa.
6. The customer is redirected after successful or failed payment.
7. The booking status is updated accordingly.

The integration uses transaction UUIDs, signed payment fields, and success/failure callbacks.

> **Note:** Payment credentials and secret keys are stored through environment variables and are not included in the repository.

## ❤️ Wishlist

Customers can save vendors to a personal wishlist.

The feature includes:

* Add vendor to wishlist
* Remove vendor from wishlist
* View saved vendors
* Wishlist status on vendor cards
* Wishlist toggle on vendor details
* Protected wishlist routes
* Persistent wishlist data
* Responsive wishlist interface

## 📱 Web & Mobile Applications

Eventish consists of:

* **Web application** — React.js
* **Mobile application** — React Native + Expo
* **Backend API** — Node.js + Express.js
* **Database** — MongoDB

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│      React Web Client       │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│    Node.js + Express.js     │
│       Backend Server        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          MongoDB            │
└─────────────────────────────┘

┌─────────────────────────────┐
│    React Native / Expo      │
│       Mobile Client         │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
          Backend API
```

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML
* CSS

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB

### Mobile

* React Native
* Expo

### Payment

* eSewa

### Development

* Git
* GitHub

## 📁 Project Structure

```text
Eventish/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── ...
│
├── mobile/
│   ├── app/
│   └── ...
│
├── ESEWA_INTEGRATION.md
├── WISHLIST_FEATURE.md
└── .gitignore
```

## 👩‍💻 My Role

### Project Leader

As the project leader, I contributed to:

* Project planning and coordination
* Full-stack development
* Backend API development
* Database design
* Recommendation system development
* Feature implementation
* Third-party payment integration
* Problem solving and debugging
* Managing development challenges
* Coordinating project tasks and milestones

## 🧠 What I Learned

Through Eventish, I gained practical experience in:

* Full-stack web development
* REST API development
* MongoDB database management
* Mobile application development
* Recommendation systems
* Third-party API integration
* Authentication and protected routes
* Debugging and problem solving
* Git/GitHub workflows
* Working collaboratively on a large software project

## 🚀 Future Improvements

Potential future improvements include:

* Improving recommendation accuracy
* Adding more advanced analytics
* Improving mobile application functionality
* Enhancing notification features
* Production deployment and performance optimization

---

### Built with React, Node.js, Express.js, MongoDB, and React Native.
