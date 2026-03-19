# 🏥 Medical Appointment App

A full-stack application for managing patients, doctors, appointments, and availability in a clinic environment.

This project was originally developed as part of a team in an organization repository.  
This repository represents my personal portfolio version of the project.

---

## 🚀 Features

- Manage patients and doctors
- Create, update, and cancel appointments
- Track doctor availability through time slots
- Automatic scheduling logic based on availability
- Emergency appointment handling
- AI-powered automation for patient and appointment creation

---

## 🧠 My Contribution

I was primarily responsible for the backend logic and system setup, including:

- ✅ **Appointment Management**
  - Create, update, and delete appointments
  - Handle appointment status changes (Scheduled, Completed, Cancelled)

- ✅ **Availability Slot Logic**
  - Implemented logic for booking and releasing doctor time slots
  - Ensured consistency between appointments and availability


- ✅ **OpenAI Integration**
  - Bulk generation of patients using AI
  - AI-assisted creation of emergency appointments
    - Automatically assigns a patient to the **first available doctor**

- ✅ **Project Setup & Architecture**
  - Initial project structure and architecture setup
  - Organized layers and responsibilities

- ✅ **Git & CI/CD**
  - Set up Git repository structure and workflow
  - Implemented CI pipeline for build and validation

---

## 🏗️ Tech Stack

- **Backend:** ASP.NET Core Web API
- **Database:** SQL Server + Entity Framework Core
- **Frontend:** React + TypeScript
- **AI Integration:** OpenAI API
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions

---

## ⚙️ How to Run

1. Clone the repository
2. Configure `appsettings.json` or use environment variables:
   - Database connection string
   - OpenAI API key
3. Run database migrations
4. Start backend and frontend

---

## 📌 Notes

- This is a **portfolio version** of a team project
- Some configurations (API keys, secrets) are replaced with placeholders