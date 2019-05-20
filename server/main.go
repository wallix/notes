package main

import (
	"log"
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
		auth.POST("/group-notes/:groupID", e.noteGroupPostHandler)
		auth.GET("/group-notes/:groupID", e.noteGroupListHandler)
		auth.GET("/group/:id", e.groupGetHandler)
		auth.PATCH("/group/:id", e.groupEditHandler)
		auth.GET("/groups", e.groupListHandler)

		auth.POST("/share/:id/:with", e.noteShareHandler)
		auth.GET("/share/notes", e.getSharedNotes)
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
		panic("failed to connect database")
	}
	// Migrate the schema
	db.AutoMigrate(&Note{})
	db.AutoMigrate(&Login{})
	db.AutoMigrate(&Group{})
	return &Env{db: db}
}

func main() {
	env := openEnv("./notes-db/notesD.db")
	defer env.db.Close()
	env.httpEngine().Run()
}
