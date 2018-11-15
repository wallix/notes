package main

import (
	jwt "github.com/appleboy/gin-jwt"
	"github.com/gin-gonic/gin"
)

var identityKey = "id"

func makePayLoad(data interface{}) jwt.MapClaims {
	if v, ok := data.(*Login); ok {
		return jwt.MapClaims{
			identityKey: v.Username,
		}
	}
	return jwt.MapClaims{}
}

func makeIdentityHandler(c *gin.Context) interface{} {
	claims := jwt.ExtractClaims(c)
	return &Login{
		Username: claims["id"].(string),
	}
}

func (e *Env) makeAuthenticator(c *gin.Context) (interface{}, error) {
	var login Login
	if err := c.ShouldBind(&login); err != nil {
		return "", jwt.ErrMissingLoginValues
	}
	userID := login.Username
	password := login.Password

	var query Login
	e.db.First(&query, "username = ?", login.Username)

	if password == query.Password {
		return &Login{
			Username: userID,
		}, nil
	}

	return nil, jwt.ErrFailedAuthentication
}

func makeAuthorizator(data interface{}, c *gin.Context) bool {
	_, ok := data.(*Login)
	return ok
}

func makeUnauthorized(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{
		"code":    code,
		"message": message,
	})
}

// retrieves owner (username) from JWT token
func getOwner(c *gin.Context) string {
	user, _ := c.Get(identityKey)
	owner := user.(*Login).Username
	return owner
}
