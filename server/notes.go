package main

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

// Note represents a note
type Note struct {
	gorm.Model
	Title   string
	Content string
	Owner   string
	Users   []*User  `gorm:"many2many:note_shared;"`
	Groups  []*Group `gorm:"many2many:note_groups;"`
}

func (e *Env) getSharedNotes(c *gin.Context) {
	var notes []Note
	user, err := e.getUser(getOwner(c))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}

	err = e.db.Model(&user).Related(&notes, "SharedNotes").Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

func (e *Env) noteListHandler(c *gin.Context) {
	var notes []Note

	owner := getOwner(c)
	err := e.db.Preload("Users").Where("owner = ?", owner).Find(&notes).Error

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}

	// /!\ Quick workaround to hide password
	// TODO : remove after db changes
	for _, note := range notes {
		for _, sharer := range note.Users {
			sharer.Password = ""
		}
	}

	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

func (e *Env) noteGetHandler(c *gin.Context) {
	var note Note
	noteID := c.Param("id")
	owner := getOwner(c)
	err := e.db.Where("owner = ? AND id = ?", owner, noteID).First(&note).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"note": note})
}

func (e *Env) noteShareHandler(c *gin.Context) {
	var note Note
	noteID := c.Param("id")
	recipientID := c.Param("with")
	owner := getOwner(c)
	// must be owner to share
	err := e.db.Where("owner = ? AND id = ?", owner, noteID).First(&note).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	// get user to share with
	login, err := e.getUser(recipientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err})
		return
	}
	// append user
	err = e.db.Model(&note).Association("Users").Append(login).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}

func validateNote(note Note) error {
	if note.Title == "" {
		return errors.New("empty title")
	}
	return nil
}

func (e *Env) createOrUpdateNote(noteID string, note *Note) error {
	// create new note
	if noteID == "" {
		return e.db.Create(&note).Error
	}
	// or update previous note
	var previous Note
	e.db.Where("ID = ?", noteID).First(&previous)
	previous.Title = note.Title
	previous.Content = note.Content
	return e.db.Save(&previous).Error
}

// FIXME: returns noteID==0 when PATCH
func (e *Env) notePostHandler(c *gin.Context) {
	var err error
	var note Note
	c.ShouldBindJSON(&note)
	err = validateNote(note)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err})
		return
	}

	// set note owner
	note.Owner = getOwner(c)
	// get the (optional) id from path
	noteID := c.Param("id")
	// create or update the note
	err = e.createOrUpdateNote(noteID, &note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err}) // SECURITY
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"noteID": note.ID,
	})
}

func (e *Env) noteGroupPostHandler(c *gin.Context) {
	var err error
	var note Note
	c.ShouldBindJSON(&note)
	err = validateNote(note)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err})
		return
	}

	// set note owner
	// note.Owner = getOwner(c)
	// get the (optional) id from path
	groupID := c.Param("id")
	// create or update the note
	err = e.createGroupNote(&note, groupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err}) // SECURITY
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"noteID": note.ID,
	})
}

func (e *Env) noteGroupListHandler(c *gin.Context) {
	var group Group
	var notes []Note
	groupID := c.Param("id")
	err := e.db.Where("id = ?", groupID).First(&group).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	err = e.db.Model(&group).Related(&notes, "Notes").Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

func (e *Env) createGroupNote(note *Note, groupID string) error {
	// associate with the group
	var group Group
	err := e.db.Where("id = ?", groupID).First(&group).Error
	if err != nil {
		return err
	}
	note.Groups = []*Group{&group}
	// create new note
	err = e.db.Save(&note).Error
	if err != nil {
		return err
	}
	return nil
}

func (e *Env) noteDelete(c *gin.Context) {
	var note Note
	// get owner and note id
	owner := getOwner(c)
	noteID := c.Param("id")
	// retrieve the note
	err := e.db.Where("owner = ? AND ID = ?", owner, noteID).First(&note).Error
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err}) // SECURITY
		return
	}
	// delete the note. TODO : remove users from sharer
	err = e.db.Delete(&note).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err}) // SECURITY
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}

func (e *Env) noteGroupDeleteHandler(c *gin.Context) {
	var note Note
	var group Group
	groupID := c.Param("id")
	noteID := c.Param("noteId")
	// Check the relation between the group and the note
	if e.db.
		Joins("JOIN note_groups ON note_id = notes.id AND group_id = ?", groupID).
		First(&note, noteID).RecordNotFound() {
		c.JSON(http.StatusNotFound, gin.H{"err": "Not Found"})
		return
	}
	// Get the group
	err := e.db.First(&group, groupID).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	// delete the group association with the note
	err = e.db.Model(&note).Association("Groups").Delete(&group).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}
