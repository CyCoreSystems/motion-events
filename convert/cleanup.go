package main

import (
	"math"
	"os"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	"github.com/golang/glog"
	"github.com/ricochet2200/go-disk-usage/du"
)

// cleanup executes cleanup routine, which deletes old
// events if the disk is full
func cleanup(percent int) {
	// Before we do anything we need to make sure our usage warrants a clean up.
	var err error
	if isLowDiskSpace(percent) {
		session := dbSession.Copy()
		defer session.Close()

		c := session.DB("cam").C("events")
		glog.Infoln("Collection initialized for cleanup")

		// q is the query--we don't ever want to return a file with a value for keep.
		q := bson.M{
			"keep": bson.M{"$exists": false},
		}
		// Return all non-keep files sorted by oldest to newest timestamp.
		iter := c.Find(q).Sort("timestamp").Iter()
		glog.Infoln("Iterator received for cleanup")

		e := Event{}
		for iter.Next(&e) {
			remove(e, c)
			if !isLowDiskSpace(percent) {
				break
			}
		}

		err = iter.Close()
		if err != nil {
			glog.Errorln("Failed to close event iterator:", err)
		}

		glog.Infoln("Completed cleanup deletions")
	}
}

func isLowDiskSpace(perc int) bool {
	// this sets us at the root directory
	usage := du.NewDiskUsage("/")
	// This returns the percentage of use.
	used := int(math.Ceil(float64(100 * usage.Usage())))
	glog.Infoln("Percent used: ", used)
	rem := 100 - used
	glog.Infoln("Percent remaining: ", rem)

	// End everything if we have more than 5% disk space. No need to start a mongo connection or continue deleting
	if rem > perc {
		return false
	}
	return true
}

// Database removal method
func removeFromDB(id string, c *mgo.Collection) {
	q := bson.M{
		"_id": id,
	}
	err := c.Remove(q)
	if err != nil {
		glog.Errorln("Failed to remove event from database, retrying before aborting")
		err = c.Remove(q)
		if err != nil {
			glog.Errorln("Failed to remove event from database twice. Not removed or not found: ", id)
		} else {
			glog.Infoln("Successfully deleted: ", id)
		}
	}

}

// remove delete all files and database entries of an event
func remove(e Event, c *mgo.Collection) {
	var err error

	glog.Infof("Removing event (%+v)\n", e)

	// See what fields we have and remove them.
	if e.VideoFile != "" {
		_, err = os.Stat(e.VideoFile)
		if err != nil {
			glog.Warningln("File doesn't exist: ", e.VideoFile)
		} else {
			err = os.Remove(e.VideoFile)
			if err != nil {
				glog.Errorln("Error deleting file: ", e.VideoFile)
			}
		}
	} else {
		glog.Infoln("No video file associated with current event: ", e.Id)
	}
	if e.ImageFile != "" {
		_, err = os.Stat(e.ImageFile)
		if err != nil {
			glog.Warningln("File doesn't exist: ", e.ImageFile)
		} else {
			err = os.Remove(e.ImageFile)
			if err != nil {
				glog.Errorln("Error deleting file: ", e.ImageFile)
			}
		}
	} else {
		glog.Infoln("No image file associated with current event: ", e.Id)
	}
	if e.WebVideoFile != "" {
		_, err = os.Stat(e.WebVideoFile)
		if err != nil {
			glog.Warningln("File doesn't exist: ", e.WebVideoFile)
		} else {
			err = os.Remove(e.WebVideoFile)
			if err != nil {
				glog.Errorln("Error deleting file: ", e.WebVideoFile)
			}
		}
	} else {
		glog.Infoln("No web video file associated with current event: ", e.Id)
	}
	// Last thing to do is remove from DB.
	removeFromDB(e.Id, c)
}
