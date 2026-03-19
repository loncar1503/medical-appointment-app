//
// Created by petrifuj on 2/23/2026.
//

#ifndef PROJECT_APP_HPP
#define PROJECT_APP_HPP
#include <iostream>
#include "HospitalManager.hpp"

using namespace std;

enum Operations {
    SCHEDULE = 1, ADD_DOCTOR,
    ADD_PATIENT, STORE_ENTRIES,
    TRACK_APPOINTMENTS, SYNC_DOCTORS, EXIT
};


class App {
public:
    App(HospitalManager& hospitalManager) : hospitalManager(&hospitalManager) {}
    void run();

private:
    HospitalManager* hospitalManager;
    bool isRunning = false;
    void writeMenu();
    void stateMachine();
    int chooseOption();
    void addDoctor();
    void addPatient();
};


#endif //PROJECT_APP_HPP