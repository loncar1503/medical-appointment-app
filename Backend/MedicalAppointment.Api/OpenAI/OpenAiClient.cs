using MedicalAppointment.Api.DTOs.Ai;
using MedicalAppointment.Domain.Entities;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace MedicalAppointment.Api.OpenAI;

public sealed class OpenAiClient
{
    private readonly HttpClient _http;
    private readonly OpenAiOptions _opt;

    public OpenAiClient(HttpClient http, IOptions<OpenAiOptions> opt)
    {
        _http = http;
        _opt = opt.Value;
    }

    public async Task<string> GeneratePatientsJsonAsync(int count, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_opt.ApiKey))
            throw new InvalidOperationException("OpenAI ApiKey is missing. Configure OpenAI:ApiKey.");

        if (count <= 0) count = 10;
        if (count > 200) count = 200;

        var system =
            "You generate realistic Serbian patient data. " +
            "Return ONLY valid JSON. No markdown. No explanation. No extra keys.";

        var user =
    "Generate " + count + " patients as a JSON array.\n\n" +
    "Each item MUST have EXACTLY these keys:\n" +
    "- FirstName (string, max 20 chars)\n" +
    "- LastName  (string, max 20 chars)\n" +
    "- Email     (valid email, unique)\n" +
    "- Phone     (valid Serbian phone, unique)\n\n" +
    "Return ONLY the JSON array. Example:\n" +
    "[\n" +
    "  {\n" +
    "    \"FirstName\": \"Ana\",\n" +
    "    \"LastName\": \"Jovic\",\n" +
    "    \"Email\": \"ana.jovic1@example.com\",\n" +
    "    \"Phone\": \"+381641234567\"\n" +
    "  }\n" +
    "]";

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _opt.ApiKey);

        var body = new
        {
            model = _opt.Model,
            temperature = 0.3,
            messages = new object[]
            {
                new { role = "system", content = system },
                new { role = "user", content = user }
            }
        };

        req.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req, ct);
        var respText = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI error {(int)resp.StatusCode}: {respText}");

        using var doc = JsonDocument.Parse(respText);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("OpenAI returned empty content.");

        content = content.Trim();
        if (content.StartsWith("```"))
        {
            content = content.Replace("```json", "", StringComparison.OrdinalIgnoreCase)
                             .Replace("```", "")
                             .Trim();
        }

        using var test = JsonDocument.Parse(content);
        if (test.RootElement.ValueKind != JsonValueKind.Array)
            throw new InvalidOperationException("OpenAI did not return a JSON array.");

        return content;
    }

    public async Task<AppointmentIntent> GenerateAppointmentIntentAsync(string text, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_opt.ApiKey))
            throw new InvalidOperationException("OpenAI ApiKey is missing. Configure OpenAI:ApiKey.");

        var system =
            "You are a medical scheduling assistant. " +
            "Extract structured intent from user text. " +
            "Return ONLY valid JSON. No markdown. No explanation.";

        var user = $@"
            User text: ""{text}""

            Return JSON object with EXACT keys:
            - PatientFullName (string or null)
            - Specialization (one of: GeneralPracticioner, Dentist, Surgeon) or null
            - AppointmentType (one of: Consultation, FollowUp, Emergency) or null
            - TimePreference (use ""ASAP"" if urgent/soonest, otherwise null)
            - Notes (short string, 1 sentence)

            Rules:
            - If patient's name is not present, set PatientFullName = null.
            - If specialization is not present, infer from keywords:
                - dentist / zubar => Dentist
                - surgeon / hirurg => Surgeon
                - gp / opsta praksa / general => GeneralPracticioner
            - If type is not present, infer:
                - emergency / hitno => Emergency
                - follow-up / kontrola => FollowUp
                - otherwise => Consultation
            Return ONLY JSON.";

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _opt.ApiKey);

        var body = new
        {
            model = _opt.Model,
            temperature = 0.2,
            messages = new object[]
            {
            new { role = "system", content = system },
            new { role = "user", content = user }
            }
        };

        req.Content = new StringContent(JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req, ct);
        var respText = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI error {(int)resp.StatusCode}: {respText}");

        using var doc = JsonDocument.Parse(respText);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("OpenAI returned empty content.");

        content = content.Trim();
        if (content.StartsWith("```"))
            content = content.Replace("```json", "", StringComparison.OrdinalIgnoreCase).Replace("```", "").Trim();

        var intent = JsonSerializer.Deserialize<AppointmentIntent>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (intent == null)
            throw new InvalidOperationException("AI intent JSON could not be parsed.");

        return intent;
    }

    public async Task<string> GenerateScheduleMessageAsync(
    string patientName,
    string doctorName,
    DateTime start,
    AppointmentType type,
    CancellationToken ct)
    {
        var system = "You are a Serbian medical assistant. Reply with ONE short sentence.";

        var user = $"""
            Patient: {patientName}
            Doctor: {doctorName}
            Start: {start:yyyy-MM-dd HH:mm}
            Type: {type}
            Write a natural Serbian confirmation message.
            """;

        return await ChatAsync(system, user, ct);
    }


    public async Task<string> ChatAsync(string systemPrompt, string userPrompt, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        req.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _opt.ApiKey);

        var body = new
        {
            model = _opt.Model,
            temperature = 0.3,
            messages = new object[]
            {
            new { role = "system", content = systemPrompt },
            new { role = "user", content = userPrompt }
            }
        };

        req.Content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(body),
            System.Text.Encoding.UTF8,
            "application/json");

        using var resp = await _http.SendAsync(req, ct);
        var respText = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            throw new InvalidOperationException(respText);

        using var doc = System.Text.Json.JsonDocument.Parse(respText);

        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return content?.Trim() ?? "";
    }


}