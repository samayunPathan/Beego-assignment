
## Cat API Project with Beego and JavaScript
This project implements a web application that interacts with The Cat API using Beego for the backend and JavaScript for frontend interactions. The application features three main sections: Voting, Breeds, and Favorites.
Features

## Voting Section

- Displays random cat images fetched from The Cat API
- Allows users to upvote or downvote images
- Enables users to add images to their favorites


## Breeds Section

- Provides a search bar with breed options fetched from the Breeds API
- Displays breed-specific images and information upon selection
- Shows breed details including name, origin, and Wikipedia link


## Favorites Section

- Displays images that users have added to their favorites
- Retrieves favorite images from the Favorites API



## Tech Stack

- Backend: Beego
- Frontend interaction : vanilla JavaScript
- API: The Cat API

## Prerequisites

- Go (version X.X or higher)
- Beego framework

## Installation

#### Clone the repository:
``` bash 
git clone https://github.com/samayunPathan/Beego-assignment.git
```
#### Go project directory
``` bash
cd Beego-assignment
```
#### Install Go dependencies:
```bash
go mod tidy
```

#### Set up your Cat API key in the Beego configuration file.

Configuration

Create a conf/app.conf file in your Beego project root.
Add your Cat API key to the configuration file:
```bash
CopycatApiKey = "your_api_key_here"
```

## Running the Application

#### Start the Beego server:
```bash
bee run
```
Open your browser and navigate to http://localhost:8080 (or the port specified in your Beego configuration).
```
Project Structure
Copycat-api-project/
├── conf/
│   └── app.conf
├── controllers/
│    └── default.go
│   
├── models/
│   └── cat.go
├── routers/
│   └── router.go
├── static/
│   └── js/
│       └── main.js
├── views/
│    └── index.tpl
│   
├── main.go
└── README.md
```
## API Integration
The project uses Go channels for API calls to The Cat API. This allows for efficient, concurrent handling of requests.
## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
## License
This project is licensed under the MIT License.
