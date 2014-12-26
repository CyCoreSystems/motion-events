package main

import (
	"fmt"
	"testing"
	"time"

	"github.com/garyburd/redigo/redis"
)

func TestStart(t *testing.T) {
	var err error
	e := Event{
		Event:  "start",
		Number: "testStartNum",
		Camera: "test",
	}

	Clean(e)

	e.Id, err = EventStart(e)
	defer Clean(e)
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}

	rc := rp.Get()
	defer rc.Close()

	// Check Enum map
	id, err := redis.String(rc.Do("GET", e.EnumKey()))
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	if id == "" {
		fmt.Println("Enum map is empty")
		t.FailNow()
	}

	// Check TTL
	ttl, err := redis.Int64(rc.Do("TTL", e.EnumKey()))
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	if ttl <= 0 {
		fmt.Println("TTL is not set", ttl)
		t.FailNow()
	}
	if ttl > int64(time.Duration(1*time.Hour).Seconds()) {
		fmt.Println("TTL is too long", ttl)
		t.FailNow()
	}

	// Check time map
	tmap, err := redis.Int64(rc.Do("ZCARD", e.TimeKey()))
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	if tmap == 0 {
		fmt.Println("Time-indexed key not found", e.TimeKey())
		t.FailNow()
	}

	// Check data
	resp, err := redis.Values(rc.Do("HGETALL", e.DataKey()))
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	dataEvent := Event{}
	err = redis.ScanStruct(resp, &dataEvent)
	if err != nil {
		fmt.Println(err)
		t.FailNow()
	}
	if dataEvent.Id != id {
		fmt.Println("Failed to retrieve event data:", e.DataKey(), dataEvent)
		t.FailNow()
	}
}
