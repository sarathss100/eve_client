# 🎫 Event Management Frontend (EVE Client)

A modern, production-ready **frontend application** built with **React, TypeScript** for managing events, organizers, attendees, and online ticket bookings.  
This is the **client-side** of the Event Management & Ticketing Platform.

🔗 **Backend Repo:** [EVE Server](https://github.com/sarathss100/eve_server)

---

## ⭐ Features

- **Authentication & Role-based Access**
  - User registration & login (Organizer & Attendee roles).
  - Protected routes using JWT tokens and cookies.
- **Organizer Panel**
  - Create, edit, delete, and list events.
  - Manage attendees for owned events.
- **Attendee Portal**
  - Browse/search events, view detailed info.
  - Book tickets (paid).
  - View all booked tickets.
- **Event Details**
  - Rich details, descriptive banners, and conditional “Book Now” (paid).
- **Modern UI**
  - Fully responsive with Tailwind CSS (or your chosen styling).
- **Error Handling**
  - Centralized error handling with friendly messages.
- **Stripe Integration**
  - Secure online payments for paid ticket booking.

---

## 🧑‍💻 Tech Stack

- **Frontend:** React, TypeScript, Vite 
- **State Management:** Zustand 
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Authentication:** JWT (httpOnly cookies from backend)
- **Payments:** Stripe Checkout

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/sarathss100/eve_client.git
cd eve_client

2. Install Dependencies
npm install

3. Setup Environment Variables

Create a .env file in the project root:

VITE_API_URI=http://localhost:5000/api   # backend API base URL
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

4. Run Development Server
npm run dev


Frontend runs by default at:
👉 http://localhost:5173

📲 Example User Flows
Organizer

Register/Login as Organizer

Create new events (set title, description, tickets, etc.)

Manage existing events (update, delete)

View attendees for events

Attendee

Register/Login as Attendee

Browse/search events

View event details

Book tickets (paid)

View booked tickets

🛠️ Best Practices & Patterns

SOLID Principles followed on backend (integration ready).

Repository + Service + Controller Pattern in backend (client consumes clean APIs).

Zod for robust frontend validation.

Strict TypeScript for type safety and maintainability.

Responsive UI for desktop and mobile.

ℹ️ Author

👨‍💻 Built by Sarath, 2025

🌐 Live Preview
https://eve-client.vercel.app/