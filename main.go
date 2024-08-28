package main

import (
	_ "cat-api-project/routers"
	beego "github.com/beego/beego/v2/server/web"
)

func main() {
	beego.Run()
}

