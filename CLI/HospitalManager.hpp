//
// Created by petrifuj on 2/24/2026.
//

#ifndef CLI_HOSPITALMANAGER_HPP
#define CLI_HOSPITALMANAGER_HPP
#include <fstream>
#include <vector>

#include "Doctor.hpp"
#include "Patient.hpp"


class HospitalManager {

public:
    void addSaveDoctor(Doctor& d);
    void addSavePatient(Patient& p);

    std::string getResponseFromBackend(const std::wstring& appName, const std::wstring& host, const int& port, const std::wstring& path, DWORD& statusCode);

    void trackAppointments();

    void exportResponseToAFile(std::string& response, std::string file_name);

    static std::string readFileContents(const std::string& filename) {
        std::ifstream file(filename);
        if (!file.is_open()) {
            return ""; // Handle error if file doesn't exist
        }

        // Read the entire file into the string in one go
        return std::string((std::istreambuf_iterator<char>(file)),
                            std::istreambuf_iterator<char>());
    }

    void storeAppointments(const std::wstring &appName, const std::wstring &host,
                                                    const int &port, const std::wstring &path, DWORD &statusCode);
private:
    std::vector<Doctor> doctors;
    const std::string doctors_file = "doctors.json";
    const std::string patients_file = "patients.json";
    const std::string appointments_file = "appointments.json";
};


#endif //CLI_HOSPITALMANAGER_HPP