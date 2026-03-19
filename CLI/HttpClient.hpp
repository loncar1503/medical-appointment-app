//
// Created by petrifuj on 2/26/2026.
//

#ifndef CLI_HTTPCLIENT_HPP
#define CLI_HTTPCLIENT_HPP
#include <string>
#include <windows.h>
#include <winhttp.h>


class HttpClient {

public:

    static HttpClient& getInstance() {
        static HttpClient instance;
        return instance;
    }

    HttpClient(const HttpClient&) = delete;
    HttpClient& operator=(const HttpClient&) = delete;

    std::string getRequest(const std::wstring& path, DWORD& outStatusCode) ;

    bool connect(const std::wstring &appName, const std::wstring &host, const int& port);

    void disconnect();

    std::string postRequest(const std::wstring& path, const std::string& postData, DWORD& outStatusCode);


private:

    HINTERNET hSession = nullptr;
    HINTERNET hConnect = nullptr;
    HttpClient()= default;
    ~HttpClient() {
        disconnect();
    };

};


#endif //CLI_HTTPCLIENT_HPP