import google.generativeai as genai
genai.configure(api_key="YOUR_GEMINI_API_KEY_HERE")
model = genai.GenerativeModel("gemini-pro")
try:
    print(model.generate_content("hello").text)
except Exception as e:
    print("Error:", e)
