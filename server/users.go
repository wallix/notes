package main

import (
	"errors"
	"fmt"
	"net/http"

	jwt "github.com/appleboy/gin-jwt"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

// Login represents a user
type Login struct {
	gorm.Model
	Username    string   `form:"username" json:"username" binding:"required"`
	Password    string   `form:"password" json:"password" binding:"required"`
	SharedNotes []*Note  `json:"-" gorm:"many2many:note_shared;"`
	Groups      []*Group `json:"-" gorm:"many2many:group_users;"`
}

type Group struct {
	gorm.Model
	Name  string   `form:"name" json:"name" binding:"required"`
	Users []*Login `json:"users" gorm:"many2many:group_users;"`
}

func (e *Env) getUser(username string) (*Login, error) {
	var login Login
	err := e.db.Where("username = ?", username).First(&login).Error
	return &login, err
}

func (e *Env) getUsers(username []string) ([]*Login, error) {
	var logins []*Login
	err := e.db.Where("username IN (?)", username).Find(&logins).Error
	return logins, err
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

func (e *Env) userListHandler(c *gin.Context) {
	var usernames []string
	search := c.Query("search")

	req := e.db.Model(&Login{}).
		Where("deleted_at IS NULL")

	if len(search) > 0 {
		req = req.Where("username LIKE ?",
			fmt.Sprintf("%%%s%%", search))
	}

	err := req.
		Order("created_at").
		Pluck("username", &usernames).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": usernames})
}

type CreateGroupRequest struct {
	Name  string
	Users []string
}

func (e *Env) groupCreateHandler(c *gin.Context) {
	var request CreateGroupRequest
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err}) // SECURITY
		return
	}
	users, err := e.getUsers(request.Users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	group := &Group{
		Name:  request.Name,
		Users: users,
	}
	err = e.db.Save(group).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": group.ID})
}

func (e *Env) groupGetHandler(c *gin.Context) {
	var group Group
	ID := c.Param("id")
	// owner := getOwner(c)
	err := e.db.Where("id = ?", ID).First(&group).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	err = e.db.Model(&group).Related(&group.Users, "Users").Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"group": group})
}

type GroupEditRequest struct {
	Name  string
	Users []string
}

func (e *Env) groupEditHandler(c *gin.Context) {
	var request GroupEditRequest
	err := c.ShouldBindJSON(&request)
	ID := c.Param("id")
	// owner := getOwner(c)
	var group Group
	err = e.db.Where("id = ?", ID).First(&group).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	group.Name = request.Name
	err = e.db.Save(&group).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	users, err := e.getUsers(request.Users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	err = e.db.Model(&group).Association("Users").Replace(users).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}
