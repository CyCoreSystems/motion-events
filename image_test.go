package main

import (
	"fmt"
	"testing"

	"code.google.com/p/go-uuid/uuid"
	"github.com/garyburd/redigo/redis"
)

func TestImage(t *testing.T) {
	var err error
	e := Event{
		Id:     uuid.New(),
		Event:  "image",
		Number: "testImageNum",
		Camera: "test",
	}

	// Start clean
	Clean(e)
	defer Clean(e)

	// Create the event to be updated
	rc := rp.Get()
	defer rc.Close()
	_, err = rc.Do("HMSET", redis.Args{}.Add(e.DataKey()).AddFlat(e)...)
	if err != nil {
		fmt.Println("Failed to create event for staging:", err)
		t.FailNow()
	}
	_, err = rc.Do("SET", e.EnumKey(), e.Id)
	if err != nil {
		fmt.Println("Failed to create enum key for staging:", err)
		t.FailNow()
	}

	// Run EventStart
	e.ImageFile = "/dummy/me.jpg"
	err = EventImage(e)
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}

	// Verify image was set
	name, err := redis.String(rc.Do("HGET", e.DataKey(), "ImageFile"))
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	if name != e.ImageFile {
		fmt.Printf("Source and destination image filename do not match: (key:%s) (src:%+s) (dst:%+s)\n", e.DataKey(), e.ImageFile, name)
		t.FailNow()
	}
}
