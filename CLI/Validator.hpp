//
// Created by petrifuj on 2/24/2026.
//

#ifndef CLI_VALIDATOR_HPP
#define CLI_VALIDATOR_HPP
#include <objbase.h>
#include <string>
#include <regex>



class Validator {
public:
    static bool isValidEmail(const std::string& email) {
        const std::regex pattern(R"((\w+)(\.{1}\w+)*@(\w+)(\.\w+)+)");
        return std::regex_match(email, pattern);
    }


    // stavljeno isto kao kolege iz C#
    static bool isValidPhone(const std::string& phone) {
        const std::regex pattern(R"((?:\+3816\d{7,8}|06\d{7,8}))");
        return std::regex_match(phone, pattern);
    }
    static bool isValidName(const std::string& name) {
        return !name.empty() && name.length() >= 3;
    }

    static bool isValidMedicalID(const std::string& id) {
        return id.length() == 36;
    }
    static std::string generateMedicalID() {
        GUID guid;
        CoCreateGuid(&guid);
        wchar_t wbuf[64];
        StringFromGUID2(guid, wbuf, 64);
        std::wstring ws(wbuf);
        std::string result(ws.begin(), ws.end());
        return result.substr(1, result.length() - 2);
    }
};


#endif //CLI_VALIDATOR_HPP