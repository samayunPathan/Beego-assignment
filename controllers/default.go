package controllers

import (
	"cat-api-project/models"
	"encoding/json"
	"github.com/beego/beego/v2/core/config"
	"github.com/beego/beego/v2/server/web"
	"net/http"
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

func (c *MainController) AddFavorite() {
	var favoriteData struct {
		CatId string `json:"catId"`
	}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &favoriteData); err != nil {
		c.Data["json"] = map[string]string{"error": "Invalid request body"}
		c.ServeJSON()
		return
	}

	// Here you would typically save the favorite to a database
	// For now, we'll just return a success message
	c.Data["json"] = map[string]string{"message": "Cat added to favorites"}
	c.ServeJSON()
}
