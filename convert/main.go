package main

import (
	"flag"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/golang/glog"

	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
)

type Event struct {
	//Id           bson.ObjectId `bson:"_id"`
	Id           string `bson:"_id"` // Meteor uses strings instead of ObjectIds
	VideoFile    string `bson:"videoFile"`
	WebVideoFile string `bson:"webVideoFile"`
	ImageFile    string `bson:"imageFile"`
}

func main() {
	flag.Parse()

	// Clean up the server/db every 6 hours
	go func() {
		Cleanup(5, "172.30.105.140")
		time.Sleep(6 * time.Hour)
	}()

	// Process videos every five minutes
	for {
		process()
		time.Sleep(time.Duration(5) * time.Minute)
	}
}

// process searches the database for any avi
// video files which do not have webm video
// files corresponding
func process() {
	mgoHost := os.Getenv("MONGO_PORT_27017_TCP_ADDR")
	mgoPort := os.Getenv("MONGO_PORT_27017_TCP_PORT")
	mgoUri := mgoHost + ":" + mgoPort
	if mgoUri == ":" {
		mgoUri = "172.30.105.140"
	}
	session, err := mgo.Dial(mgoUri)
	if err != nil {
		panic("Failed to connect to mongodb:" + err.Error())
	}
	defer session.Close()
	glog.Infoln("Connected to mongodb")

	c := session.DB("cam").C("events")
	q := bson.M{
		"videoFile":    bson.M{"$exists": true},
		"webVideoFile": bson.M{"$exists": false},
	}
	iter := c.Find(q).Iter()

	e := Event{}
	for iter.Next(&e) {
		fn, err := convert(&e)
		if err != nil {
			glog.Errorln("Failed to convert event video:", e.VideoFile, err)
			continue
		}
		// Otherwise, update the event with the webm file's location
		err = c.Update(bson.M{"_id": e.Id}, bson.M{"$set": bson.M{"webVideoFile": fn}})
		if err != nil {
			glog.Errorln("Failed to update mongodb with webvideofile:", err)
		}
	}
	err = iter.Close()
	if err != nil {
		glog.Errorln("Failed to close event iterator:", err)
	}
}

// convert converts an .avi video recording of
// an event into a web-capable webm video recording
func convert(e *Event) (string, error) {
	glog.Infoln("Converting", e.VideoFile)
	newFilename := strings.TrimSuffix(e.VideoFile, ".avi") + ".webm"
	cmd := exec.Command("avconv", "-i", e.VideoFile, "-c", "vp8", newFilename)
	err := cmd.Run()
	if err != nil {
		glog.Errorln("Error converting video file:", err)
	}
	return newFilename, err
}
