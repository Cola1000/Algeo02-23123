# Tugas Besar Aljabar Linear dan Geometri 02

![License](https://img.shields.io/badge/license-MIT-AC0003.svg)
![Version](https://img.shields.io/badge/built_using-Vite-C870F1.svg)
![Build Status](https://img.shields.io/badge/type-Tugas_Besar-brightgreen.svg)
![Contributors](https://img.shields.io/badge/contributors-3_(person)_+_1_(Waifu)-FF4500.svg)

<h1 align="center">
  <a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.herokuapp.com?font=Righteous&pause=500&color=FFFFFF&size=35&center=true&vCenter=true&random=false&width=435&lines=Welcome+to+:+;Hatsune+Mix[ue]" alt="Hatsune Mix[ue]" /></a>
</h1>

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)
- [Contributor](#contributor)

---

## About the Project

**HatsuneMix-ue** is a web application designed to provide functionalities for recognizing album covers and performing Music Information Retrieval (MIR). It is specifically developed as a project for Algebra and Geometry coursework. The project aims to:

- Implement Principal Component Analysis (PCA) for image recognition.
- Develop algorithms for Music Information Retrieval (MIR).
- Design an innovative and intuitive user interface (UI).

### Built With

![Three.js](https://img.shields.io/badge/three-0.171.x-049EF4.svg)
![Axios](https://img.shields.io/badge/axios-1.7.9-A166FF.svg)
![Framework](https://img.shields.io/badge/framework-React-58C4DC.svg)

---

## Features

- **Album Cover Recognition**: Utilize Principal Component Analysis (PCA) to accurately identify album covers from a given dataset.
- **Music Information Retrieval (MIR)**: Implement advanced algorithms to retrieve metadata and analyze music files.
- **Innovative User Interface**: Offer a unique, user-friendly interface designed for intuitive navigation and accessibility.

---

## Installation

Follow these steps to get the application running on your local machine:

1. **Download the ZIP Release**  
   - Navigate to the repository’s releases page and download the latest zip file.

2. **Extract the ZIP File**  
   - Unzip the downloaded file to your preferred location.

3. **Open a Terminal**  
   - Navigate (`cd`) to the folder where you extracted the project.

4. **Set Up Python Environment**  
   1. Run:
      ```bash
      pyenv 3.11.9
      ```
   2. Then:
      ```bash
      pyenv local 3.11.9
      ```
   3. Check your Python version:
      ```bash
      python --version
      ```
      - It should display `3.11.9`.

5. **Update Requirements File**  
   - Replace the existing contents of `requirements.txt` with the following:
     ```txt
     uvicorn
     fastapi
     rarfile
     numpy
     pillow
     music21
     basic_pitch
     python-multipart
     ```

6. **Install Python Dependencies**  
   - In your terminal, run:
     ```bash
     pip install -r src/backend/requirements.txt
     ```
   - This installs all the necessary backend dependencies.

7. **Navigate to the `src` Directory**  
   - Make sure your terminal is in the `src` directory, which contains the `backend` folder:
     ```bash
     cd src
     ```

8. **Run the Backend Server**  
   - From the `src` directory, start the FastAPI server:
     ```bash
     uvicorn backend.main:app --reload
     ```
   - Keep this terminal window open and running.

9. **Open Another Terminal**  
   - You will need a second terminal to run the frontend.

10. **Navigate to the React Frontend**  
    - `cd` into:
      ```bash
      cd src/frontend/Hatsune_Mixue
      ```

11. **Install Frontend Dependencies**  
    1. Install npm packages:
       ```bash
       npm install
       ```
    2. Run the development server:
       ```bash
       npm run dev
       ```

12. **Access the Application**  
    - Open your browser and go to the address displayed in your second terminal, typically:
      ```
      http://localhost:3000
      ```
    - The FastAPI backend will be running at:
      ```
      http://localhost:8000
      ```

### Additional Notes

- Pre-requisites:
  - Ensure you have Node.js installed (version `16.x` or higher is recommended).
  - Verify that npm is available by running `npm -v` in your terminal.
- Environment Variables:
  - If your project requires any API keys or environment variables, make sure to set them up in a `.env` file within the project root directory. (Check `.env.example` if available.)
- Access the Application:
  - Once the server starts, open your browser and go to the URL displayed in the terminal (e.g., `http://localhost:3000`).

### Optional Improvements

1. Add a Script to Simplify Setup  
   Create a `setup.sh` (Linux/macOS) or `setup.bat` (Windows) script to automate the process:
   - Example `setup.sh`:
     ```bash
     #!/bin/bash
     cd ./src/frontend/Hatsune_Mixue/ || exit
     npm install
     npm run dev
     ```

   - Example `setup.bat` (Windows):
     ```cmd
     cd .\srcrontend\Hatsune_Mixue
     npm install
     npm run dev
     ```

   Then instruct users to run `./setup.sh` (Linux/macOS) or `setup.bat` (Windows) for setup.

2. Dockerize the Application  
   Use Docker to containerize your application so users don’t need to worry about dependencies:
   - Create a `Dockerfile`:
     ```dockerfile
     FROM node:16
     WORKDIR /app
     COPY ./src/frontend/Hatsune_Mixue/ .
     RUN npm install
     CMD ["npm", "run", "dev"]
     ```
   - Add a `docker-compose.yml` file for easy startup:
     ```yaml
     version: '3.8'
     services:
       hatsune_mixue:
         build: .
         ports:
           - "3000:3000"
     ```
   Users can then run:
   ```bash
   docker-compose up --build
   ```

3. Improve Documentation  
   Include a `README.md` with detailed setup, troubleshooting tips, and contribution guidelines.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a pull request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contributor

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="20.28%"><a href="https://github.com/Cola1000"><img style="border-radius: 15%" src="https://avatars.githubusercontent.com/u/143616767?v=4" width="115px;" alt="Cola1000"/><br /><sub><b>Rhio Bimo P S. <br /> 13523123 </b></sub></a><br /></td>
      <td align="center" valign="top" width="20.28%"><a href="https://github.com/V-Kleio"><img style="border-radius: 15%" src="https://avatars.githubusercontent.com/u/101655336?v=4" width="115px;" alt="V-Kleio"/><br /><sub><b>Rafael Marchel D W. <br /> 13523146 </b></sub></a><br /></td>
      <td align="center" valign="top" width="20.28%"><a href="https://github.com/wiwekaputera"><img style="border-radius: 15%" src="https://avatars.githubusercontent.com/u/78787384?v=4" width="115px;" alt="wiwekaputra"/><br /><sub><b>I Made Wiweka P. <br /> 13523160 </b></sub></a><br /></td>
    </tr>
  </tbody>
</table>

---
