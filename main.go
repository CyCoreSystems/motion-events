package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/bmizerany/pat"
	"github.com/garyburd/redigo/redis"
	"github.com/golang/glog"
)

var rp *redis.Pool

func init() {
	// Initialize redis pool
	rp = newPool()
}

func main() {
	r := pat.New()

	r.Post("/event", http.HandlerFunc(HandleEvent))

	http.Handle("/", r)

	glog.Fatal(http.ListenAndServe(":8080", r))
}

// newPool creates a new Redis connection pool
func newPool() *redis.Pool {
	var server = ":6379"
	if os.Getenv("REDIS_PORT_TCP_ADDR") != "" {
		server = os.Getenv("REDIS_PORT_TCP_ADDR") + ":" + os.Getenv("REDIS_PORT_TCP_PORT")
	}

	return &redis.Pool{
		MaxIdle:     3,
		IdleTimeout: 240 * time.Second,
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", server)
			if err != nil {
				return nil, err
			}
			return c, err
		},
		TestOnBorrow: func(c redis.Conn, t time.Time) error {
			_, err := c.Do("PING")
			return err
		},
	}
}

// Event describes a unique motion event
type Event struct {
	Id        string // Unique identifier for event
	Timestamp int64  // Unix Timestamp of event
	Camera    string // Camera identifier
	ImageFile string // File and path for image
	VideoFile string // File and path for video

	Event  string `redis:"-"` // Type of event
	Number string `redis:"-"` // Event enumerator
}

// DataKey returns the redis data key of the event
// based on its uuid (Id)
func (e *Event) DataKey() string {
	return "events:data:" + e.Id
}

// TimeKey returns the redis key for the time
// and camera to event uuid map
func (e *Event) TimeKey() string {
	return "events:time:" + e.Camera
}

// EnumKey returns the redis key for the motion
// event number and camera to event uuid map
func (e *Event) EnumKey() string {
	return "events:enum:" + e.Camera + ":" + e.Number
}

// IdFromEnum retrieves the Id from the enum map
func (e *Event) IdFromEnum() (string, error) {
	rc := rp.Get()
	defer rc.Close()

	// Retrieve enum reference
	id, err := redis.String(rc.Do("GET", e.EnumKey()))
	if err != nil {
		glog.Errorf("Failed to retrieve enum map (%+v): %s\n", e, err.Error())
		return id, err
	}
	if id == "" {
		glog.Errorf("No enum map found for (%+v)\n", e)
		return id, fmt.Errorf("No enum map found for (%+v)\n", e)
	}
	return id, nil
}

// HandleEvent is an http request handler which passes a
// received event to the appropriate handler
func HandleEvent(res http.ResponseWriter, req *http.Request) {
	decoder := json.NewDecoder(req.Body)
	var e Event
	err := decoder.Decode(&e)
	if err != nil {
		glog.Errorln("Failed to parse event:", err)
		res.WriteHeader(http.StatusBadRequest)
		res.Write([]byte("Invalid event format"))
		return
	}

	switch e.Event {
	case "start":
		go EventStart(e)
	case "image":
		go EventImage(e)
	case "video":
		go EventVideo(e)
	default:
		glog.Errorf("Unhandled event type: %+v\n", e)
	}

	res.WriteHeader(http.StatusOK)
	return
}
