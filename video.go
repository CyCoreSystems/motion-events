package main

import "github.com/golang/glog"

func EventVideo(e Event) error {
	var err error
	rc := rp.Get()
	defer rc.Close()

	// Retrieve enum reference
	e.Id, err = e.IdFromEnum()
	if err != nil {
		glog.Errorf("Failed to retrieve enum map (%+v): %s\n", e, err.Error())
		return err
	}

	// Update data with event
	_, err = rc.Do("HSET", e.DataKey(), "VideoFile", e.VideoFile)
	if err != nil {
		glog.Errorf("Failed to update video file (%+v): %s", e, err.Error())
		return err
	}

	return nil
}
