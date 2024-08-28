package routers

import (
	"cat-api-project/controllers"

	"github.com/beego/beego/v2/server/web"
)

func init() {
	web.Router("/", &controllers.MainController{})
	web.Router("/breeds", &controllers.MainController{}, "get:GetBreeds")
	web.Router("/random-cat", &controllers.MainController{}, "get:GetRandomCat")
	web.Router("/breed-images/", &controllers.MainController{}, "get:GetBreedImages")
	web.Router("/favorite", &controllers.MainController{}, "post:AddFavorite")
	// New route to fetch all images for a specific breed
	web.Router("/breed-images/:breed_id", &controllers.MainController{}, "get:GetBreedImages")
	// for favorite
	web.Router("/favorite", &controllers.MainController{}, "post:AddFavorite")
	web.Router("/favorites", &controllers.MainController{}, "get:GetFavorites")

}
