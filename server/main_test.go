package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"sort"
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
	return m, err
}

func deleteJSON(t *testing.T, url string, token string, expectedStatus int) (map[string]interface{}, error) {
	var m map[string]interface{}
	request, err := http.NewRequest("DELETE", url, strings.NewReader(""))
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
func methodJSON(t *testing.T, method string, url string, data map[string]interface{}, token *string, expectedStatus int) (map[string]interface{}, error) {
	var m map[string]interface{}
	body, _ := json.Marshal(data)

	if debug {
		t.Log("postJSON:query body= ", string(body))
	}

	request, err := http.NewRequest(method, url, bytes.NewReader(body))
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

func postJSON(t *testing.T, url string, data map[string]interface{}, token *string, expectedStatus int) (map[string]interface{}, error) {
	return methodJSON(t, "POST", url, data, token, expectedStatus)
}

func patchJSON(t *testing.T, url string, data map[string]interface{}, token *string, expectedStatus int) (map[string]interface{}, error) {
	return methodJSON(t, "PATCH", url, data, token, expectedStatus)
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
	// login before subscribe
	result, err := postJSON(t, "/login", user, nil, http.StatusUnauthorized)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// subscribe
	result, err = postJSON(t, "/subscribe", user, nil, 200)
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
	if errMsg, exists := result["err"]; exists {
		t.Fatalf("Unexpected error %+v %+v %+v", err, errMsg, result)
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

func TestNoteDelete(t *testing.T) {
	// users := []Credentials{Credentials{"alice-delete", "haha"}, Credentials{"bob-delete", "hoho"}}
	users := []map[string]interface{}{
		map[string]interface{}{
			"username": "alice-delete",
			"password": "haha",
		},
		map[string]interface{}{
			"username": "bob-delete",
			"password": "hoho",
		},
	}

	tokens := make([]string, 2)
	noteIds := make([]float64, 2)

	for idx, user := range users {
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
		tokens[idx] = result["token"].(string)
		// post note
		note := map[string]interface{}{
			"title":   fmt.Sprintf("Note of %s", user["username"]),
			"content": "this is content",
		}
		result, err = postJSON(t, "/auth/notes", note, &tokens[idx], 200)
		if err != nil {
			t.Fatalf("Non-expected error: %v", err)
		}
		log.Printf("Result : %+v", result)
		noteIds[idx] = result["noteID"].(float64)
	}

	// User 1 delete note of user 2
	_, err := deleteJSON(t, fmt.Sprintf("/auth/notes/%v", noteIds[1]), tokens[0], http.StatusForbidden)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// User 1 delete note of user 1
	_, err = deleteJSON(t, fmt.Sprintf("/auth/notes/%v", noteIds[0]), tokens[0], http.StatusOK)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
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
	note2 := map[string]interface{}{
		"title":   "title will not be shared",
		"content": "content will not be shared",
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

	// user2 logs in
	result, err = postJSON(t, "/login", user2, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token2 := result["token"].(string)
	// get notes and check length
	result, err = getJSON(t, "/auth/notes", token2, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes := result["notes"].([]interface{})
	if len(notes) != 0 {
		t.Fatalf("Wrong number of notes: %v in %+v", len(notes), notes)
	}

	// user2 creates note and get ID
	result, err = postJSON(t, "/auth/notes", note2, &token2, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	noteIDuser2 := int(result["noteID"].(float64))

	// user1 get user2's note and fail
	result, err = getJSON(t, fmt.Sprintf("/auth/notes/%v", noteIDuser2), token, http.StatusForbidden)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// notes = result["notes"].([]interface{})
	// if len(notes) != 2 {
	// 	t.Fatalf("Wrong number of notes: %v in %+v", len(notes), notes)
	// }

	// user1 shares note with user2
	empty := map[string]interface{}{}
	result, err = postJSON(t, fmt.Sprintf("/auth/share/%v/%v", noteID, user2["username"]), empty, &token, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// user1 shares note2 with user2 and fail
	result, err = postJSON(t, fmt.Sprintf("/auth/share/%v/%v", noteIDuser2, user2["username"]), empty, &token, http.StatusForbidden)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

	// user2 get notes and check length
	result, err = getJSON(t, "/auth/notes", token2, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes = result["notes"].([]interface{})
	if len(notes) != 2 {
		t.Fatalf("Wrong number of notes: %v in %+v", len(notes), notes)
	}
}

func TestGroup(t *testing.T) {
	var err error
	user1 := map[string]interface{}{
		"username": "toto_group",
		"password": "totopass",
	}
	user2 := map[string]interface{}{
		"username": "titi_group",
		"password": "titipass",
	}
	user3 := map[string]interface{}{
		"username": "tata_group",
		"password": "tatapass",
	}
	group := map[string]interface{}{
		"name":  "my group",
		"users": []string{user1["username"].(string), user2["username"].(string)},
	}
	// create 3 users
	_, err = postJSON(t, "/subscribe", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	_, err = postJSON(t, "/subscribe", user2, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	_, err = postJSON(t, "/subscribe", user3, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// login first user and get token
	result, err := postJSON(t, "/login", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token1 := result["token"].(string)
	result, err = postJSON(t, "/login", user2, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token2 := result["token"].(string)
	result, err = postJSON(t, "/login", user3, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token3 := result["token"].(string)
	// user1 creates the group
	result, err = postJSON(t, "/auth/group", group, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	groupID := result["id"]
	// user1 get the group description
	result, err = getJSON(t, fmt.Sprintf("/auth/group/%v", groupID), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	compareGroups(t, group, result["group"].(map[string]interface{}))
	// user1 get his groups
	result, err = getJSON(t, "/auth/groups", token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	hasGroups(t, []string{"my group"}, result["groups"].([]interface{}))
	// user1 edit the group description
	group = map[string]interface{}{
		"name":  "my renamed group",
		"users": []string{user1["username"].(string)},
	}
	_, err = patchJSON(t, fmt.Sprintf("/auth/group/%v", groupID), group, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// user1 get the group description after edit
	result, err = getJSON(t, fmt.Sprintf("/auth/group/%v", groupID), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	compareGroups(t, group, result["group"].(map[string]interface{}))
	// user1 create another group
	anotherGroup := map[string]interface{}{
		"name":  "another group",
		"users": []string{user1["username"].(string), user2["username"].(string)},
	}
	result, err = postJSON(t, "/auth/group", anotherGroup, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	sharedGroupID := result["id"]
	// user1 get his groups
	result, err = getJSON(t, "/auth/groups", token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	hasGroups(t, []string{"another group", "my renamed group"}, result["groups"].([]interface{}))
	// post note (twice)
	note := map[string]interface{}{
		"title":   "this is title group",
		"content": "this is content group",
	}
	result, err = postJSON(t, fmt.Sprintf("/auth/group/%v/notes", groupID), note, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	result, err = postJSON(t, fmt.Sprintf("/auth/group/%v/notes", groupID), note, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// get notes and check length
	result, err = getJSON(t, fmt.Sprintf("/auth/group/%v/notes", groupID), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes := result["notes"].([]interface{})
	if len(notes) != 2 {
		t.Fatalf("Wrong number of notes: %v", len(notes))
	}
	note0 := notes[0].(map[string]interface{})
	if note0["Title"].(string) != "this is title group" {
		t.Fatalf("First note has wrong title: %v", note0["Title"].(string))
	}
	// Test get of 1 note
	// get notes and check length
	result, err = getJSON(t, fmt.Sprintf("/auth/group/%v/notes/%v", groupID, note0["ID"]), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	newNote0 := result["note"].(map[string]interface{})
	if note0["CreatedAt"] != newNote0["CreatedAt"] {
		t.Fatalf("Group note is different than before")
	}
	// user2 can access group 2, not user 3
	_, err = getJSON(t, fmt.Sprintf("/auth/group/%v/notes", sharedGroupID), token2, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	_, err = getJSON(t, fmt.Sprintf("/auth/group/%v/notes", sharedGroupID), token3, http.StatusForbidden)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
}

func TestGroupNoteDelete(t *testing.T) {
	var err error
	user1 := map[string]interface{}{
		"username": "toto_group_2",
		"password": "totopass2",
	}
	group := map[string]interface{}{
		"name":  "my group",
		"users": []string{user1["username"].(string)},
	}
	// create 1 users
	_, err = postJSON(t, "/subscribe", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	// login first user and get token
	result, err := postJSON(t, "/login", user1, nil, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	token1 := result["token"].(string)

	note := map[string]interface{}{
		"title":   "title",
		"content": "content",
	}
	// user1 creates note and get ID
	result, err = postJSON(t, "/auth/notes", note, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	noteID := int(result["noteID"].(float64))

	// user1 creates the group
	result, err = postJSON(t, "/auth/group", group, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	groupID := result["id"]

	// post note in the group
	note = map[string]interface{}{
		"title":   "this is title group note",
		"content": "this is content group note",
	}
	result, err = postJSON(t, fmt.Sprintf("/auth/group/%v/notes", groupID), note, &token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

	// get notes and check length
	result, err = getJSON(t, fmt.Sprintf("/auth/group/%v/notes", groupID), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes := result["notes"].([]interface{})
	if len(notes) != 1 {
		t.Fatalf("Wrong number of notes: %v", len(notes))
	}
	note0 := notes[0].(map[string]interface{})

	// DELETE the note
	result, err = deleteJSON(t, fmt.Sprintf("/auth/group/%v/notes/%v", groupID, note0["ID"]), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

	// get notes and check length
	result, err = getJSON(t, fmt.Sprintf("/auth/group/%v/notes", groupID), token1, 200)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}
	notes = result["notes"].([]interface{})
	if len(notes) != 0 {
		t.Fatalf("Wrong number of notes: %v", len(notes))
	}
	// DELETE the note using group authorization and fail
	result, err = deleteJSON(t, fmt.Sprintf("/auth/group/%v/notes/%v", groupID, noteID), token1, 404)
	if err != nil {
		t.Fatalf("Non-expected error: %v", err)
	}

}

func hasGroups(t *testing.T, expected []string, groups []interface{}) {
	if len(expected) != len(groups) {
		t.Fatalf("Expected %v groups, have %v groups", len(expected), len(groups))
	}
	var groupsName []string
	for _, g := range groups {
		name := g.(map[string]interface{})["name"].(string)
		groupsName = append(groupsName, name)
	}
	sort.StringSlice(expected).Sort()
	sort.StringSlice(groupsName).Sort()
	for i := range expected {
		if expected[i] != groupsName[i] {
			t.Fatalf("expect groups(%v), has group(%v)", expected, groupsName)
		}
	}
}

func compareGroups(t *testing.T, post, result map[string]interface{}) {
	if result["name"].(string) != post["name"].(string) {
		t.Fatalf("The group is not well named, %v != %v", result["name"], post["name"])
	}
	var resultUsers []string
	users := result["users"].([]interface{})
	for _, u := range users {
		resultUsers = append(resultUsers, u.(map[string]interface{})["username"].(string))
	}
	postUsers := post["users"].([]string)
	if len(resultUsers) != len(postUsers) {
		t.Fatalf("The group has not the same size: %v vs %v", len(postUsers), len(resultUsers))
	}
	sort.StringSlice(resultUsers).Sort()
	sort.StringSlice(postUsers).Sort()
	for i := range postUsers {
		if postUsers[i] != resultUsers[i] {
			t.Fatalf("The groups are note equals")
		}
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
