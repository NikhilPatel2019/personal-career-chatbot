# personal-career-chatbot
Chat about my career using this bot

1. Generate python virtual environment using:
    ```
    python -m venv venv
    ```
2. Activate virtual environemnt using:
    ```
    venv\Scripts\activate
    ```

3. Install packages:
    ```
    pip install -r requirements.txt
    ```

4. Start the server
    ```
    uvicorn main:app --reload
    ```

Todos:
- [ ] Token Calculation and model selection
- [ ] Summary generaion if token limit exceeds
- [ ] Build frontend
    - [X] Vite+React+TS setup
    - [X] chat ui
    - [X] Functionality
    - [X] API Integration
- [ ] Standalone python app with gradio
- [ ] Update System Prompt
