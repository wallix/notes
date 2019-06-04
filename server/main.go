package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	jwt "github.com/appleboy/gin-jwt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

// Env represents the server environment (db, etc.)
type Env struct {
	db *gorm.DB
}

func groupMembershipRequired(e *Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("id")
		owner := getOwner(c)
		var login User

		// e.db.First(&group, "id = ?", groupID)
		// e.db.First(&login, "username = ?", owner)
		// err := e.db.Model(&group).Related(&login, "Users").Error
		err := e.db.
			Joins("JOIN group_users ON user_id = users.id AND group_id = ?", groupID).
			Where("username = ?", owner).
			Find(&login).Error

		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"err": "You're not allowed to access or manage this group"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (e *Env) httpEngine() *gin.Engine {
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "User-Agent", "Referrer", "Host", "Token", "Authorization"}
	r.Use(cors.New(config))

	// JWT middleware
	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		Realm:            "Notes Server 0.0.1",
		SigningAlgorithm: "RS256",
		PubKeyFile:       "./public.pem",
		PrivKeyFile:      "./key.pem",
		Timeout:          time.Hour,
		MaxRefresh:       time.Hour,
		IdentityKey:      identityKey,
		PayloadFunc:      makePayLoad,
		IdentityHandler:  makeIdentityHandler,
		Authenticator:    e.makeAuthenticator,
		Authorizator:     makeAuthorizator,
		Unauthorized:     makeUnauthorized,
		TokenLookup:      "header: Authorization, query: token, cookie: jwt",
		TimeFunc:         time.Now,
	})
	if err != nil {
		log.Fatal("JWT Error: " + err.Error())
	}

	r.POST("/subscribe", e.subscribeHandler)
	r.POST("/login", authMiddleware.LoginHandler)

	auth := r.Group("/auth")
	// Refresh time can be longer than token timeout
	auth.GET("/refresh_token", authMiddleware.RefreshHandler)
	auth.Use(authMiddleware.MiddlewareFunc())
	{
		auth.POST("/update/password", e.subscribeHandler)

		auth.GET("/notes", e.noteListHandler)
		auth.GET("/notes/:id", e.noteGetHandler)
		auth.POST("/notes", e.notePostHandler)
		auth.PATCH("/notes/:id", e.notePostHandler)
		auth.DELETE("/notes/:id", e.noteDelete)

		auth.GET("/users", e.userListHandler)

		auth.POST("/group", e.groupCreateHandler)
		auth.GET("/groups", e.groupListHandler)

		group := auth.Group("/group/:id")
		group.Use(groupMembershipRequired(e))
		{
			group.GET("", e.groupGetHandler)
			group.PATCH("", e.groupEditHandler)
			group.GET("/notes", e.noteGroupListHandler)
			group.POST("/notes", e.noteGroupPostHandler)
			group.DELETE("/notes/:noteId", e.noteGroupDeleteHandler)
		}

		auth.POST("/share/:id/:with", e.noteShareHandler)
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	return r
}

func openEnv(name string) *Env {
	db, err := gorm.Open("sqlite3", name)
	if err != nil {
		panic(fmt.Sprintf("failed to connect database : %+v", err))
	}
	// Migrate the schema
	db.AutoMigrate(&Note{}, &Auth{}, &User{}, &Group{})
	return &Env{db: db}
}

func main() {
	env := openEnv("./notes-db/notesE.db")
	defer env.db.Close()
	env.httpEngine().Run()
}
