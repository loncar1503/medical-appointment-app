//
// Created by petrifuj on 2/24/2026.
//

#ifndef CLI_DOCTOR_HPP
#define CLI_DOCTOR_HPP
#include <string>

#include "json.hpp"
#include <objbase.h>


class Doctor {

public:

    Doctor(const std::string& n,const std::string& spec,const std::string& phoneNum, const std::string& email){
        this->name = n;
        this->specialization = spec;
        this->phoneNumber = phoneNum;
        this->email = email;
    }

    std::string getName() const;


    std::string getSpecialization() const;


    std::string getPhoneNumber() const;

    std::string getEmail() const;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE(Doctor, name, specialization, email ,phoneNumber)

private:
    std::string name;
    std::string specialization;
    std::string phoneNumber;
    std::string email;
};


#endif //CLI_DOCTOR_HPP