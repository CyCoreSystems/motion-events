package main

import (
	"fmt"
	"testing"

	"code.google.com/p/go-uuid/uuid"
	"github.com/garyburd/redigo/redis"
)

func TestVideo(t *testing.T) {
	var err error
	e := Event{
		Id:     uuid.New(),
		Event:  "video",
		Number: "testVideoNum",
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
	e.VideoFile = "/dummy/me.mp4"
	err = EventVideo(e)
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}

	// Verify video was set
	name, err := redis.String(rc.Do("HGET", e.DataKey(), "VideoFile"))
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	if name != e.VideoFile {
		fmt.Printf("Source and destination video filename do not match: (key:%s) (src:%+s) (dst:%+s)\n", e.DataKey(), e.VideoFile, name)
		t.FailNow()
	}
}
