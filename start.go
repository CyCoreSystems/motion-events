package main

import (
	"time"

	"code.google.com/p/go-uuid/uuid"
	"github.com/garyburd/redigo/redis"
	"github.com/golang/glog"
)

func EventStart(e Event) (string, error) {
	rc := rp.Get()
	defer rc.Close()

	e.Id = uuid.New()

	e.Timestamp = time.Now().Unix()

	// Map the enumerator to our canonical event id
	_, err := rc.Do("SET", e.EnumKey(), e.Id)
	if err != nil {
		glog.Errorf("Failed to set enum key (%+v): %s\n", e, err.Error())
		return e.Id, err
	}
	_, err = rc.Do("EXPIRE", e.EnumKey(), int64((time.Duration(1) * time.Hour).Seconds()))
	if err != nil {
		glog.Errorf("Failed to set EXPIRE on key (%+v): %s\n", e, err.Error())
		return e.Id, err
	}

	// Create the time-ordered keymap
	_, err = rc.Do("ZADD", e.TimeKey(), time.Now().Unix(), e.Id)
	if err != nil {
		glog.Errorf("Failed to set time key (%+v): %s\n", e, err.Error())
		return e.Id, err
	}

	// Create skeleton event data
	_, err = rc.Do("HMSET", redis.Args{}.Add(e.DataKey()).AddFlat(e)...)
	if err != nil {
		glog.Errorf("Failed to set time key (%+v): %s\n", e, err.Error())
		return e.Id, err
	}

	return e.Id, nil
}
