package main

import (
	"errors"
	"net/http"

	jwt "github.com/appleboy/gin-jwt"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

// Login represents a user
type Login struct {
	gorm.Model
	Username    string  `form:"username" json:"username" binding:"required"`
	Password    string  `form:"password" json:"password" binding:"required"`
	SharedNotes []*Note `gorm:"many2many:note_shared;"`
}

func (e *Env) getUser(username string) (*Login, error) {
	var login Login
	err := e.db.Where("username = ?", username).First(&login).Error
	return &login, err
}

func (e *Env) changePassword(username string, json Login) error {
	var login Login
	if username != json.Username {
		return (errors.New("username does not match"))
	}
	e.db.Where("username = ?", username).First(&login)
	login.Password = json.Password
	return e.db.Save(&login).Error
}

// create a new account, or update the password of an existing account
func (e *Env) subscribeHandler(c *gin.Context) {
	var login Login
	if err := c.ShouldBindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err}) // SECURITY
		return
	}
	// case: user is already logged in, password update
	// TODO: move to jwt.go helper function
	claims := jwt.ExtractClaims(c)
	_, exists := c.Get(identityKey)
	if exists {
		err := e.changePassword(claims["id"].(string), login)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"err": err}) // SECURITY
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "password changed"})
		return
	}
	// case: user is not logged in, create a new account
	var query Login
	err := e.db.First(&query, "username = ?", login.Username).Error
	if err == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": "user exists"})
		return
	}
	err = e.db.Save(&login).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err}) // SECURITY
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "user created", "userID": login.ID})
}
