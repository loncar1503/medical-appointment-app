//
// Created by petrifuj on 2/24/2026.
//

#include "HospitalManager.hpp"

#include <fstream>
#include <iostream>

#include "json.hpp"
#include <windows.h>
#include <winhttp.h>
#include <filesystem>
#include <iomanip>
#include <sstream>
#include <chrono>
#include <set>
#include <thread>

#include "HttpClient.hpp"

#pragma comment(lib, "winhttp.lib")

using json = nlohmann::json;


void HospitalManager::addSaveDoctor(Doctor &d) {
    std::ifstream inFile(doctors_file);
    json doctors;
    if (inFile.good()) {
        inFile >> doctors;
        inFile.close();
    } else {
        doctors = json::array();
    }

    doctors.push_back(d);

    std::ofstream outFile(doctors_file);
    outFile << doctors.dump(4);
    outFile.close();
}

void HospitalManager::addSavePatient(Patient &p) {
    std::ifstream inFile(patients_file);
    json patients;
    if (inFile.good()) {
        inFile >> patients;
        inFile.close();
    } else {
        patients = json::array();
    }

    patients.push_back(p);

    std::ofstream outFile(patients_file);
    outFile << patients.dump(4);
    outFile.close();
}

void HospitalManager::exportResponseToAFile(std::string &response, std::string file_name) {
    std::cout << "CSV fetched - " << response.length() << " bytes!" << std::endl;

    // CSV filename: YYYYMMDD_HHMMSS_doctors.csv
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&time_t), "%Y%m%d_%H%M%S") << "_" << file_name << ".csv";
    std::string timestamp_file = ss.str();

    std::ofstream outFile(timestamp_file, std::ios::binary);
    outFile << response;
    outFile.close();
    std::cout << "File saved" << std::endl << std::endl;
}

std::string HospitalManager::getResponseFromBackend(const std::wstring &appName, const std::wstring &host,
                                                    const int &port, const std::wstring &path, DWORD &statusCode) {
    auto &client = HttpClient::getInstance();
    client.connect(appName, host, port);
    statusCode = 0;
    std::string response = client.getRequest(path, statusCode);
    client.disconnect();


    return response;
}

void HospitalManager::storeAppointments(const std::wstring &appName, const std::wstring &host,
                                                    const int &port, const std::wstring &path, DWORD &statusCode) {
    std::string data = readFileContents(appointments_file);
    auto &client = HttpClient::getInstance();
    client.connect(appName, host, port);
    statusCode = 0;
    std::string response = client.postRequest(path, data ,statusCode);
    client.disconnect();
    std::cout << response;
}

void HospitalManager::trackAppointments() {
    DWORD statusCode = 0;

    // Create the filename ONCE when the command starts
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << "Report_" << std::put_time(std::localtime(&time_t), "%Y%m%d_%H%M%S") << ".txt";
    std::string reportFile = ss.str();

    std::set<std::string> seenLines;
    std::cout << "Monitoring... Saving to " << reportFile << std::endl;
    int cnt = 1;
    bool running = true;
    while (running) {
        std::string response = getResponseFromBackend(L"CLI-DoctorApp", L"localhost", 5085, L"/api/Appointment/export", statusCode);

        if (statusCode == 200) {
            std::stringstream responseStream(response);
            std::string line;

            std::getline(responseStream, line); // Skip header
            while (std::getline(responseStream, line)) {
                if (line.empty()) continue;

                if (seenLines.find(line) == seenLines.end()) {
                    seenLines.insert(line);

                    std::cout << "\n--- New Appointment "  << cnt << "---\n" << line << std::endl;
                    cnt++;
                    std::ofstream outFile(reportFile, std::ios::app);
                    outFile << line << std::endl;
                }
            }
        } else {
            std::cout << "API Error! " << statusCode << std::endl;
        }

        std::cout << "Press ESC to exit... " << std::endl << std::endl;

        for (int i = 0; i < 250; i++) {
            if (GetAsyncKeyState(VK_ESCAPE) & 0x8000) {
                running = false; // Break out of the sleep loop if a key is pressed
                break;
            }

            std::this_thread::sleep_for(std::chrono::milliseconds(20));
        }
    }
}


