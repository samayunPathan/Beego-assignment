package controllers

import (
	"bytes"
	"cat-api-project/models"
	"encoding/json"
	"io"
	"net/http"

	"github.com/beego/beego/v2/core/config"
	"github.com/beego/beego/v2/server/web"
)

type MainController struct {
	web.Controller
}

func (c *MainController) Get() {
	c.TplName = "index.tpl"
}

func (c *MainController) GetBreeds() {
	apiKey, _ := config.String("catApiKey")
	breedsChan := make(chan []models.Breed)

	go func() {
		resp, err := http.Get("https://api.thecatapi.com/v1/breeds?api_key=" + apiKey)
		if err != nil {
			c.Data["json"] = map[string]string{"error": err.Error()}
			c.ServeJSON()
			return
		}
		defer resp.Body.Close()

		var breeds []models.Breed
		json.NewDecoder(resp.Body).Decode(&breeds)
		breedsChan <- breeds
	}()

	breeds := <-breedsChan
	c.Data["json"] = breeds
	c.ServeJSON()
}

func (c *MainController) GetRandomCat() {
	apiKey, _ := config.String("catApiKey")
	breedId := c.GetString("breed_id")
	catChan := make(chan models.Cat)

	go func() {
		url := "https://api.thecatapi.com/v1/images/search?api_key=" + apiKey
		if breedId != "" {
			url += "&breed_ids=" + breedId
		}
		resp, err := http.Get(url)
		if err != nil {
			c.Data["json"] = map[string]string{"error": err.Error()}
			c.ServeJSON()
			return
		}
		defer resp.Body.Close()

		var cats []models.Cat
		json.NewDecoder(resp.Body).Decode(&cats)
		if len(cats) > 0 {
			catChan <- cats[0]
		} else {
			catChan <- models.Cat{}
		}
	}()

	cat := <-catChan
	c.Data["json"] = cat
	c.ServeJSON()
}

func (c *MainController) GetBreedImages() {
	breedId := c.Ctx.Input.Param(":id")
	apiKey, _ := config.String("catApiKey")
	imagesChan := make(chan []models.Cat)

	go func() {
		resp, err := http.Get("https://api.thecatapi.com/v1/images/search?breed_ids=" + breedId + "&limit=10&api_key=" + apiKey)
		if err != nil {
			c.Data["json"] = map[string]string{"error": err.Error()}
			c.ServeJSON()
			return
		}
		defer resp.Body.Close()

		var images []models.Cat
		json.NewDecoder(resp.Body).Decode(&images)
		imagesChan <- images
	}()

	images := <-imagesChan
	c.Data["json"] = images
	c.ServeJSON()
}

// ======  favorite  ======

func (c *MainController) AddFavorite() {
	apiKey, _ := config.String("catApiKey")
	var favoriteData struct {
		CatId string `json:"catId"`
	}

	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &favoriteData); err != nil {
		c.Data["json"] = map[string]string{"error": "Invalid request body"}
		c.ServeJSON()
		return
	}

	// Prepare the request body for The Cat API
	apiURL := "https://api.thecatapi.com/v1/favourites/"
	requestBody := map[string]string{
		"image_id": favoriteData.CatId,
		"sub_id":   "demo-0.060766054451763274", // Replace with your actual sub_id
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to marshal JSON"}
		c.ServeJSON()
		return
	}

	// Make a POST request to The Cat API
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to create HTTP request"}
		c.ServeJSON()
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey) // Replace with your actual API key

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to send request to The Cat API"}
		c.ServeJSON()
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to read response from The Cat API"}
		c.ServeJSON()
		return
	}

	// Return the response from The Cat API as JSON
	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}

func (c *MainController) GetFavorites() {
	apiKey, _ := config.String("catApiKey")
	subID := "demo-0.060766054451763274" // Replace with your actual sub_id
	// Prepare the request to The Cat API
	apiURL := "https://api.thecatapi.com/v1/favourites?sub_id=" + subID // Replace with your actual sub_id
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to create HTTP request"}
		c.ServeJSON()
		return
	}
	req.Header.Set("x-api-key", apiKey) // Replace with your actual API key

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to send request to The Cat API"}
		c.ServeJSON()
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to read response from The Cat API"}
		c.ServeJSON()
		return
	}

	// Return the response from The Cat API as JSON
	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}

// to upvote , downvote

func (c *MainController) VoteCat() {
	apiKey, _ := web.AppConfig.String("catApiKey")
	var voteData struct {
		CatID string `json:"catId"`
		Vote  string `json:"vote"`
	}

	// Parse the incoming JSON request body
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &voteData); err != nil {
		c.Data["json"] = map[string]string{"error": "Invalid request body"}
		c.ServeJSON()
		return
	}

	// Convert the "vote" string into a boolean value for the API
	var voteValue int
	if voteData.Vote == "like" {
		voteValue = 1
	} else if voteData.Vote == "dislike" {
		voteValue = -1
	} else {
		c.Data["json"] = map[string]string{"error": "Invalid vote value"}
		c.ServeJSON()
		return
	}

	// Prepare the request body for The Cat API
	apiURL := "https://api.thecatapi.com/v1/votes"
	requestBody := map[string]interface{}{
		"image_id": voteData.CatID,
		"value":    voteValue,
		"sub_id":   "demo-0.71141670112621075", // Replace with your actual sub_id
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to marshal JSON"}
		c.ServeJSON()
		return
	}

	// Make a POST request to The Cat API
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to create HTTP request"}
		c.ServeJSON()
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey) // Replace with your actual API key

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to send request to The Cat API"}
		c.ServeJSON()
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to read response from The Cat API"}
		c.ServeJSON()
		return
	}

	// Return the response from The Cat API as JSON
	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}

// GetVotes retrieves votes associated with a specific sub_id from The Cat API
func (c *MainController) GetVotes() {
	apiKey, _ := web.AppConfig.String("catApiKey")
	sub_id := "demo-0.71141670112621075" // Ensure this matches the one used during voting

	// Prepare the request to The Cat API
	apiURL := "https://api.thecatapi.com/v1/votes?sub_id=" + sub_id
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to create HTTP request"}
		c.ServeJSON()
		return
	}
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to send request to The Cat API"}
		c.ServeJSON()
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.Data["json"] = map[string]string{"error": "Failed to read response from The Cat API"}
		c.ServeJSON()
		return
	}

	// Check if the response is empty and handle it accordingly
	if len(body) == 0 || string(body) == "[]" {
		c.Data["json"] = map[string]interface{}{"message": "No votes found"}
		c.ServeJSON()
		return
	}

	// Return the response from The Cat API as JSON
	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}
