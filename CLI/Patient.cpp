//
// Created by tamtegel on 2/24/2026.
//

#include "Patient.hpp"

std::string Patient :: getFirstName() const {
    return first_name;
};

std::string Patient :: getLastName() const {
    return last_name;
};

std::string Patient :: getEmail() const {
    return email;
};

std::string Patient :: getPhoneNumber() const {
    return phoneNumber;
};

std::string Patient :: getMedicalID() const {
    return medicalID;
};
