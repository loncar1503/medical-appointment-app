#include <iostream>

#include "App.hpp"

#include "Doctor.hpp"

int main() {
    HospitalManager hospitalManager = HospitalManager();
    App* app = new App(hospitalManager);
    app->run();

}