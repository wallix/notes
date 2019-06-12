package main

import (
	"github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
)

var identityKey = "id"

func makePayLoad(data interface{}) jwt.MapClaims {
	if v, ok := data.(*User); ok {
		return jwt.MapClaims{
			identityKey: v.Username,
		}
	}
	return jwt.MapClaims{}
}

func makeIdentityHandler(c *gin.Context) interface{} {
	claims := jwt.ExtractClaims(c)
	return &User{
		Username: claims["id"].(string),
	}
}

func (e *Env) makeAuthenticator(c *gin.Context) (interface{}, error) {
	var request Credentials
	if err := c.ShouldBind(&request); err != nil {
		return "", jwt.ErrMissingLoginValues
	}
	var user User
	err := e.db.Table("users").
		Joins("JOIN auths ON users.id = user_id").
		Where("username = ? and password = ?", request.Username, request.Password).First(&user).Error
	if err != nil {
		return nil, jwt.ErrFailedAuthentication
	}
	return &User{
		Username: request.Username,
	}, nil
}

func makeAuthorizator(data interface{}, c *gin.Context) bool {
	_, ok := data.(*User)
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
	owner := user.(*User).Username
	return owner
}
