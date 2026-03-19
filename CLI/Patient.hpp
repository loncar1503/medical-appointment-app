//
// Created by tamtegel on 2/24/2026.
//

#ifndef CLI_PATIENT_HPP
#define CLI_PATIENT_HPP
#include <string>

#include "json.hpp"


class Patient {

    public:
    Patient(const std::string& firstName, const std::string&lastName, const std::string&email, const std::string&phone, const std::string&medicalID) {

        this->first_name = firstName;
        this->last_name= lastName;
        this->email = email;
        this->phoneNumber = phone;
        this->medicalID = medicalID;
    };
    std::string getFirstName() const;

    std::string getLastName() const;

    std::string getEmail() const;

    std::string getPhoneNumber() const;

    std::string getMedicalID() const;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE(Patient,
        first_name,
        last_name,
        email,
        phoneNumber,
        medicalID)

private:
    std::string first_name;
    std::string last_name;
    std::string email;
    std::string phoneNumber;
    std::string medicalID;

};


#endif //CLI_PATIENT_HPP











