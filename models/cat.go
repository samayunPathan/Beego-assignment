package models

type Cat struct {
	ID     string `json:"id"`
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type Breed struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Origin       string `json:"origin"`
	WikipediaURL string `json:"wikipedia_url"` // Add this field
}
