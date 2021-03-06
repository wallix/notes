package main

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

// Credentials is the json object for credentials
type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// User represents a user
type User struct {
	gorm.Model
	Username string   `form:"username" json:"username" binding:"required"`
	Notes    []*Note  `json:"-" gorm:"many2many:note_shared;"`
	Groups   []*Group `json:"-" gorm:"many2many:group_users;"`
}

// Auth contains password
type Auth struct {
	gorm.Model
	UserID   int
	User     User `gorm:"foreignkey:UserID"`
	Password string
}

// Group represents a group
type Group struct {
	gorm.Model
	Name  string  `form:"name" json:"name" binding:"required"`
	Users []*User `json:"users" gorm:"many2many:group_users;"`
	Notes []*Note `gorm:"many2many:note_groups;"`
}

func (e *Env) getUser(username string) (*User, error) {
	var login User
	err := e.db.Where("username = ?", username).First(&login).Error
	return &login, err
}

func (e *Env) getUsers(username []string) ([]*User, error) {
	var logins []*User
	err := e.db.Where("username IN (?)", username).Find(&logins).Error
	return logins, err
}

func (e *Env) changePassword(username string, json Credentials) error {
	var login Auth
	if username != json.Username {
		return (errors.New("username does not match"))
	}
	e.db.Where("username = ?", username).First(&login)
	login.Password = json.Password
	return e.db.Save(&login).Error
}

// create a new account, or update the password of an existing account
func (e *Env) subscribeHandler(c *gin.Context) {
	var login Credentials
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
	var user User
	err := e.db.Table("users").
		Where("username = ? and password = ?", login.Username, login.Password).
		Joins("JOIN auths ON users.id = user_id").First(&user).Error
	if err == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": "user exists"})
		return
	}
	var query = Auth{Password: login.Password, User: User{Username: login.Username}}
	err = e.db.Save(&query).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err}) // SECURITY
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "user created", "userID": query.ID})
}

func (e *Env) userListHandler(c *gin.Context) {
	var usernames []string
	search := c.Query("search")

	req := e.db.Model(&User{}).
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

// CreateGroupRequest format of create request
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

// GroupEditRequest format of edit request
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

func (e *Env) groupListHandler(c *gin.Context) {
	owner, err := e.getUser(getOwner(c))
	err = e.db.Preload("Users").Model(&owner).Related(&owner.Groups, "Groups").Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"groups": owner.Groups})
}
