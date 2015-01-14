package main

import (
	"math"
	"os"

	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"

	"github.com/golang/glog"
	"github.com/ricochet2200/go-disk-usage/du"
)

func Cleanup(percent int, defaultPort string) {
	// Before we do anything we need to make sure our usage warrants a clean up.
	var err error
	TestBool = true
	if checkDiskSpace(percent) {
		session := startConnection(defaultPort)
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
			checkAndRemove(e, c)
			if !checkDiskSpace(percent) {
				break
			}
		}

		err = iter.Close()
		if err != nil {
			glog.Errorln("Failed to close event iterator:", err)
		}
	}
}

func startConnection(defaultPort string) *mgo.Session {
	mgoHost := os.Getenv("MONGO_PORT_27017_TCP_ADDR")
	mgoPort := os.Getenv("MONGO_PORT_27017_TCP_PORT")
	mgoUri := mgoHost + ":" + mgoPort
	if mgoUri == ":" {
		mgoUri = defaultPort
	}
	glog.Infoln("MGO uri: ", mgoUri)
	session, err := mgo.Dial(mgoUri)
	if err != nil {
		panic("Failed to connect to mongodb:" + err.Error())
	}
	glog.Infoln("Connected to mongodb")

	return session
}

var TestBool bool

func checkDiskSpace(perc int) bool {
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

func checkAndRemove(e Event, c *mgo.Collection) error {
	var err error
	// See what fields we have and remove them.
	if e.VideoFile != "" {
		_, err = os.Stat(e.VideoFile)
		if err != nil {
			glog.Errorln("File doesn't exist: ", e.VideoFile)
		} else {
			err = os.Remove(e.VideoFile)
			if err != nil {
				glog.Errorln("Error deleting file: ", e.VideoFile)
				return err
			}
		}
	} else {
		glog.Infoln("No video file associated with current event: ", e.Id)
	}
	if e.ImageFile != "" {
		_, err = os.Stat(e.ImageFile)
		if err != nil {
			glog.Errorln("File doesn't exist: ", e.ImageFile)
		} else {
			err = os.Remove(e.ImageFile)
			if err != nil {
				glog.Errorln("Error deleting file: ", e.ImageFile)
				return err
			}
		}
	} else {
		glog.Infoln("No image file associated with current event: ", e.Id)
	}
	if e.WebVideoFile != "" {
		_, err = os.Stat(e.WebVideoFile)
		if err != nil {
			glog.Errorln("File doesn't exist: ", e.WebVideoFile)
		} else {
			err = os.Remove(e.WebVideoFile)
			if err != nil {
				glog.Errorln("Error deleting file: ", e.WebVideoFile)
				return err
			}
		}
	} else {
		glog.Infoln("No web video file associated with current event: ", e.Id)
	}
	// Last thing to do is remove from DB.
	removeFromDB(e.Id, c)
	return nil
}
