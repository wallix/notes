package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

var env *Env
var server *gin.Engine
var debug bool

// Simple test
func TestHandlePingReturnsWithStatusOK(t *testing.T) {
	request, _ := http.NewRequest("GET", "/ping", nil)
	response := httptest.NewRecorder()
	server.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Errorf("Status code expected %v, got: %v", http.StatusOK, response.Code)
	}
}

func getJSON(t *testing.T, url string, token string, expectedStatus int) (map[string]interface{}, error) {
	var m map[string]interface{}
	request, err := http.NewRequest("GET", url, strings.NewReader(""))
	if err != nil {
		return m, err
	}
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("Authorization", "Bearer "+token)

	response := httptest.NewRecorder()
	server.ServeHTTP(response, request)

	if response.Code != expectedStatus {
		t.Errorf("Status code expected %v, got: %v", expectedStatus, response.Code)
	}

	err = json.NewDecoder(response.Body).Decode(&m)
	return m, nil
}

// Utility function to POST JSON and get JSON result
// TODO: extract Bearer
func postJSON(t *testing.T, url string, data map[string]interface{}, token *string, expectedStatus int) (map[string]interface{}, error) {
	var m map[string]interface{}
	body, _ := json.Marshal(data)

	if debug {
		t.Log("postJSON:query body= ", string(body))
	}

	request, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		return m, err
	}
	request.Header.Add("Content-Type", "application/json")
	if token != nil {
		request.Header.Add("Authorization", "Bearer "+*token)
	}

	response := httptest.NewRecorder()
	server.ServeHTTP(response, request)

	if response.Code != expectedStatus {
		return m, fmt.Errorf("Status code expected %v, got: %v", expectedStatus, response.Code)
	}

	err = json.NewDecoder(response.Body).Decode(&m)

	// print headers and body
	if debug {
		b, _ := json.Marshal(response.HeaderMap)
		t.Log("postJSON:response headers= ", string(b))
		b, _ = json.Marshal(m)
		t.Log("postJSON:response body= ", string(b))
	}

	return m, err
}

func TestCreateUserAndLogInPostAndGetNotes(t *testing.T) {
	user := map[string]interface{}{
		"username": "admin",
		"password": "admintopsecretpass",
	}
	note := map[string]interface{}{
		"title":   "this is title",
		"content": "this is content",
	}
	// subscribe
	result, err := postJSON(t, "/subscribe", user, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	if result["status"] != "user created" {
		t.Fatalf("Non-expected response: %v", result)
	}
	// login
	result, err = postJSON(t, "/login", user, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token := result["token"].(string)
	t.Log(token)
	// post note (twice)
	result, err = postJSON(t, "/auth/notes", note, &token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	result, err = postJSON(t, "/auth/notes", note, &token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// get notes and check length
	result, err = getJSON(t, "/auth/notes", token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes := result["notes"].([]interface{})
	if len(notes) != 2 {
		t.Fatalf("Wrong number of notes: %v", len(notes))
	}
	note0 := notes[0].(map[string]interface{})
	if note0["Title"].(string) != "this is title" {
		t.Fatalf("First note has wrong title: %v", note0["Title"].(string))
	}
}

func TestUserListing(t *testing.T) {
	var err error
	user1 := map[string]interface{}{
		"username": "toto_for_listing",
		"password": "totopass",
	}
	user2 := map[string]interface{}{
		"username": "titi_for_listing",
		"password": "titipass",
	}
	// create 2 users
	_, err = postJSON(t, "/subscribe", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	_, err = postJSON(t, "/subscribe", user2, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

	// login
	result, err := postJSON(t, "/login", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token := result["token"].(string)

	result, err = getJSON(t, "/auth/users", token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

	if _, ok := result["err"].([]interface{}); ok {
		t.Fatalf("I should not receive error %+v", result)
	}

	if users, ok := result["users"].([]interface{}); ok {
		if len(users) < 2 {
			t.Fatalf("User list should contains at least 2 users")
		}

		user1Received := false
		user2Received := false

		for _, u := range users {
			if u.(string) == user1["username"].(string) {
				user1Received = true
			}
			if u.(string) == user2["username"].(string) {
				user2Received = true
			}
		}

		if !user1Received {
			t.Fatalf("User list should contains user1")
		}
		if !user2Received {
			t.Fatalf("User list should contains user2")
		}
	} else {
		t.Fatalf("I should not receive %+v", result)
	}

	result, err = getJSON(t, "/auth/users?search=titi", token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

	users := result["users"].([]interface{})
	if len(users) < 1 {
		t.Fatalf("Expect to receive at least one titi")
	}

}

func TestNoteSharing(t *testing.T) {
	var err error
	user1 := map[string]interface{}{
		"username": "toto",
		"password": "totopass",
	}
	user2 := map[string]interface{}{
		"username": "titi",
		"password": "titipass",
	}
	note := map[string]interface{}{
		"title":   "title will be shared",
		"content": "content will be shared",
	}
	// create 2 users
	_, err = postJSON(t, "/subscribe", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	result, err := postJSON(t, "/subscribe", user2, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// user2ID := result["userID"]
	// login first user and get token
	result, err = postJSON(t, "/login", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token := result["token"].(string)
	// user1 creates note and get ID
	result, err = postJSON(t, "/auth/notes", note, &token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	noteID := int(result["noteID"].(float64))
	// user1 shares note with user2
	empty := map[string]interface{}{}
	result, err = postJSON(t, fmt.Sprintf("/auth/share/%v/%v", noteID, user2["username"]), empty, &token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// user2 logs in
	result, err = postJSON(t, "/login", user2, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token = result["token"].(string)
	// user2 retrieves shared notes
	result, err = getJSON(t, "/auth/share/notes", token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes := result["notes"].([]interface{})
	if len(notes) != 1 {
		t.Fatalf("Wrong number of notes: %v", len(notes))
	}
}

func TestMain(m *testing.M) {
	// setup database
	_ = os.Remove("test.db")
	env = openEnv("test.db")
	debug = false
	env.db.LogMode(debug)
	defer env.db.Close()
	// setup server
	server = env.httpEngine()

	result := m.Run()
	os.Exit(result)
}
