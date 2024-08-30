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

// Function to handle errors
func handleAPIError(c *MainController, err error, errMsg string) {
	c.Data["json"] = map[string]string{"error": errMsg + ": " + err.Error()}
	c.ServeJSON()
}

func (c *MainController) GetBreeds() {
	apiKey, _ := config.String("catApiKey")
	breedsChan := make(chan []models.Breed)
	errorChan := make(chan error)

	go func() {
		defer close(breedsChan)
		defer close(errorChan)

		resp, err := http.Get("https://api.thecatapi.com/v1/breeds?api_key=" + apiKey)
		if err != nil {
			errorChan <- err
			return
		}
		defer resp.Body.Close()

		var breeds []models.Breed
		if err := json.NewDecoder(resp.Body).Decode(&breeds); err != nil {
			errorChan <- err
			return
		}
		breedsChan <- breeds
	}()

	select {
	case breeds := <-breedsChan:
		c.Data["json"] = breeds
	case err := <-errorChan:
		handleAPIError(c, err, "Failed to fetch breeds")
	}
	c.ServeJSON()
}

func (c *MainController) GetRandomCat() {
	apiKey, _ := config.String("catApiKey")
	breedId := c.GetString("breed_id")
	catChan := make(chan models.Cat)
	errorChan := make(chan error)

	go func() {
		defer close(catChan)
		defer close(errorChan)

		url := "https://api.thecatapi.com/v1/images/search?api_key=" + apiKey
		if breedId != "" {
			url += "&breed_ids=" + breedId
		}
		resp, err := http.Get(url)
		if err != nil {
			errorChan <- err
			return
		}
		defer resp.Body.Close()

		var cats []models.Cat
		if err := json.NewDecoder(resp.Body).Decode(&cats); err != nil {
			errorChan <- err
			return
		}
		if len(cats) > 0 {
			catChan <- cats[0]
		} else {
			catChan <- models.Cat{}
		}
	}()

	select {
	case cat := <-catChan:
		c.Data["json"] = cat
	case err := <-errorChan:
		handleAPIError(c, err, "Failed to fetch random cat")
	}
	c.ServeJSON()
}

func (c *MainController) GetBreedImages() {
	breedId := c.Ctx.Input.Param(":id")
	apiKey, _ := config.String("catApiKey")
	imagesChan := make(chan []models.Cat)
	errorChan := make(chan error)

	go func() {
		defer close(imagesChan)
		defer close(errorChan)

		resp, err := http.Get("https://api.thecatapi.com/v1/images/search?breed_ids=" + breedId + "&limit=10&api_key=" + apiKey)
		if err != nil {
			errorChan <- err
			return
		}
		defer resp.Body.Close()

		var images []models.Cat
		if err := json.NewDecoder(resp.Body).Decode(&images); err != nil {
			errorChan <- err
			return
		}
		imagesChan <- images
	}()

	select {
	case images := <-imagesChan:
		c.Data["json"] = images
	case err := <-errorChan:
		handleAPIError(c, err, "Failed to fetch breed images")
	}
	c.ServeJSON()
}

func (c *MainController) AddFavorite() {
	apiKey, _ := config.String("catApiKey")
	var favoriteData struct {
		CatId string `json:"catId"`
	}

	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &favoriteData); err != nil {
		handleAPIError(c, err, "Invalid request body")
		return
	}

	apiURL := "https://api.thecatapi.com/v1/favourites/"
	requestBody := map[string]string{
		"image_id": favoriteData.CatId,
		"sub_id":   "demo-samayun",
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		handleAPIError(c, err, "Failed to marshal JSON")
		return
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		handleAPIError(c, err, "Failed to create HTTP request")
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		handleAPIError(c, err, "Failed to send request to The Cat API")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		handleAPIError(c, err, "Failed to read response from The Cat API")
		return
	}

	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}

func (c *MainController) GetFavorites() {
	apiKey, _ := config.String("catApiKey")
	subID := "demo-samayun" // ensure subID match
	apiURL := "https://api.thecatapi.com/v1/favourites?sub_id=" + subID
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		handleAPIError(c, err, "Failed to create HTTP request")
		return
	}
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		handleAPIError(c, err, "Failed to send request to The Cat API")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		handleAPIError(c, err, "Failed to read response from The Cat API")
		return
	}

	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}

// delete fav

func (c *MainController) DeleteFavorite() {
	apiKey, _ := config.String("catApiKey")
	favoriteID := c.Ctx.Input.Param(":favorite_id")
	apiURL := "https://api.thecatapi.com/v1/favourites/" + favoriteID

	req, err := http.NewRequest("DELETE", apiURL, nil)
	if err != nil {
		handleAPIError(c, err, "Failed to create HTTP request")
		return
	}
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		handleAPIError(c, err, "Failed to send request to The Cat API")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		handleAPIError(c, err, "Failed to delete favorite")
		return
	}

	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
}

// end del fav

func (c *MainController) VoteCat() {
	apiKey, _ := web.AppConfig.String("catApiKey")
	var voteData struct {
		CatID string `json:"catId"`
		Vote  string `json:"vote"`
	}

	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &voteData); err != nil {
		handleAPIError(c, err, "Invalid request body")
		return
	}

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

	apiURL := "https://api.thecatapi.com/v1/votes"
	requestBody := map[string]interface{}{
		"image_id": voteData.CatID,
		"value":    voteValue,
		"sub_id":   "demo-samayun",
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		handleAPIError(c, err, "Failed to marshal JSON")
		return
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		handleAPIError(c, err, "Failed to create HTTP request")
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		handleAPIError(c, err, "Failed to send request to The Cat API")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		handleAPIError(c, err, "Failed to read response from The Cat API")
		return
	}

	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}

func (c *MainController) GetVotes() {
	apiKey, _ := web.AppConfig.String("catApiKey")
	sub_id := "demo-samayun" // ensure subID match

	apiURL := "https://api.thecatapi.com/v1/votes?sub_id=" + sub_id
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		handleAPIError(c, err, "Failed to create HTTP request")
		return
	}
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		handleAPIError(c, err, "Failed to send request to The Cat API")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		handleAPIError(c, err, "Failed to read response from The Cat API")
		return
	}

	if len(body) == 0 || string(body) == "[]" {
		c.Data["json"] = map[string]interface{}{"message": "No votes found"}
		c.ServeJSON()
		return
	}

	c.Ctx.ResponseWriter.WriteHeader(resp.StatusCode)
	c.Ctx.ResponseWriter.Write(body)
}
